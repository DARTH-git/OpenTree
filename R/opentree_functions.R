# OpenTree functions

if (!require(tidyverse)) install.packages('tidyverse'); library(tidyverse)
if (!require(jsonlite)) install.packages('jsonlite'); library(jsonlite)
if (!require(rstudioapi)) install.packages('rstudioapi'); library(rstudioapi)

#' readOpenTreeModel
#' \code{readOpenTreeModel} reads and converts JSON file into R dataframe
#'
#' @param treeName name of the tree model
#' @return a dataframe to be processed
#'
#' @export
#'
readOpenTreeModel <- function(treeName){
  require(tidyverse)
  #fileName <- paste0("OpenTree_", treeName, ".json")
  fileName <- paste0(treeName, ".json")
  startlist <- jsonlite::fromJSON(fileName, flatten = TRUE)
  list_json <- map_if(startlist, is.data.frame, list)
  json_df <- as_tibble(list_json)
  iterate_flag <- T
  while (iterate_flag){
    json_df <- json_df %>% unnest(keep_empty = T)
    cnames <- colnames(json_df)
    iterate_flag <- "children" %in% cnames
  }
  return(json_df)
}

#' create_OpenTree_df
#' \code{create_OpenTree_df} reads and converts JSON file into a re-formatted R dataframe
#'
#' @param treeName name of the tree model
#' @return a dataframe to be processed
#'
#' @export
#'
create_OpenTree_df <- function(treeName){
  # first convert json to dataframe
  model_df <- readOpenTreeModel(treeName) #converts the model into a df

  # then collapse probabilities
  df0 <- model_df %>%
    mutate(branch = row_number()) %>%
    pivot_longer(-branch) %>%
    mutate(tree_attr = unlist(strsplit(gsub("([a-z]*)([0-9]*)", "\\1", name), " ")),
           tree_lvl = as.numeric(strsplit(gsub("([a-z]*)([0-9]*)", "\\2", name), " "))) %>%
    mutate(tree_lvl = if_else(is.na(tree_lvl), 0, tree_lvl)) %>%
    pivot_wider(id_cols = c(branch, tree_lvl), names_from = "tree_attr", values_from = "value") %>%
    filter(!is.na(id))

  df1 <- df0 %>%
    mutate(l_probability = lead(probability)) %>%
    filter(type == "chance") %>%
    group_by(branch) %>%
    summarize(prob_chain = paste(l_probability, collapse = ","))

  decision = df0$type[1] == "decision"
  markov = df0$type[1] == "markov"
  if(decision){
    df_final <- create_OpenTree_df_decision(df0, df1)
  }
  if(markov){
    df_final <- create_OpenTree_df_markov(df0, df1)
  }
  return(df_final)
}

#' create_OpenTree_df_decision
#' \code{create_OpenTree_df_decision} post-processes the decision tree R dataframe
#'
#' @param df_input input dataframe
#' @param df1 side dataframe
#' @return processed dataframe
#'
#' @export
#'
create_OpenTree_df_decision <- function(df_input, df1){

  df1 <- df_input %>%
    mutate(l_probability = paste0("(",lead(probability),")")) %>%
    filter(type == "chance") %>%
    group_by(branch) %>%
    summarize(prob_chain = paste(l_probability, collapse = "*"))

  df2 <- df_input %>%
    filter(type == "terminal") %>%
    select(branch, payoff)

  dec_names <- df_input %>%
    filter(tree_lvl == 1) %>%
    distinct(name) %>%
    mutate(decision_id = 1:n())

  df3 <- df_input %>%
    filter(tree_lvl == 1) %>%
    group_by(id) %>%
    group_indices

  df_combined <- data.frame(branch = 1:nrow(df1),
                            decision_id = df3) %>%
    inner_join(df1) %>%
    inner_join(df2)
  df_final <- df_combined %>%
    #mutate(ev = paste("prod(", prob_chain, ") *", payoff, sep = "")) %>%
    group_by(decision_id) %>%
    summarize(v_prob = paste0("c(", paste(prob_chain, collapse = ","), ")"),
              v_payoff = paste0("c(", paste(payoff, collapse = ","), ")")) %>%
    inner_join(dec_names)
  return(df_final)
}

#' create_OpenTree_df_markov
#' \code{create_OpenTree_df_markov} post-processes the Markov decision tree R dataframe
#'
#' @param df_input input dataframe
#' @param df1 side dataframe
#' @return processed dataframe
#'
#' @export
#'
create_OpenTree_df_markov <- function(df_input, df1){
  #
  # each branch must have state1 and state2
  df2 <- df_input %>%
    filter(type %in% c("chance", "terminal")) %>%
    group_by(branch) %>%
    mutate(min_lvl = tree_lvl == min(tree_lvl),
           max_lvl = tree_lvl == max(tree_lvl)) %>%
    group_by(branch) %>%
    mutate(state1 = max(if_else(min_lvl, name, "")),
           state2 = max(if_else(max_lvl, payoff, "")),
           p0 = max(if_else(min_lvl, probability, ""))) %>%
    distinct(branch, p0, state1, state2)

  state_ids <- df2 %>%
    ungroup() %>%
    distinct(state1) %>%
    mutate(state_id = row_number()) %>%
    rename(state = "state1")

  df2_5 <- df2 %>%
    left_join(state_ids, by = c("state1" = "state")) %>%
    rename(state1_id = "state_id") %>%
    left_join(state_ids, by = c("state2" = "state")) %>%
    rename(state2_id = "state_id")

  # join transition probs with states
  # and collapse branches with similar starts and end states
  df3 <- full_join(df1, df2_5) %>%
    mutate(prob_chain = if_else(is.na(prob_chain), "1",
                                paste("prod(", prob_chain, ")", sep = ""))) %>%
    group_by(state1_id, state2_id) %>%
    summarize(p0 = max(p0),
              prob_chain = paste(prob_chain, collapse = "+"))


  # convert to a matrix
  df4 <- df3 %>%
    pivot_wider(id_cols = "state1_id",
                names_from = "state2_id",
                values_from = "prob_chain",
                names_sort = TRUE) %>%
    arrange(state1_id)

  df4[is.na(df4)] <- "0"
  P_str <- as.data.frame(df4 %>% ungroup() %>% select(-state1_id))
  colnames(P_str) <- rownames(P_str) <- state_ids$state

  p0_str <- df2 %>%
    ungroup() %>%
    distinct(state1, p0)
  df_final <- list(P_str = P_str,
                   p0_str = p0_str)

  return(df_final)
}

#' evaluate_model
#' \code{evaluate_model} evaluates the decision model
#'
#' @param input_string OpenTree-compatible dataframe
#' @param params list of model input parameters
#' @param treetype type of decision tree (decision or markov)
#' @param n_payoffs number of payoffs
#' @return evaluated model output
#'
#' @export
#'
evaluate_model <- function(input_string, params, treetype, n_payoffs){
  if (treetype == "decision") {
    if (any(class(input_string) == "data.frame")){
      y <- input_string
      y <- input_string[, !names(y) == "name"]
      nr = nrow(input_string)
      nc = ncol(input_string)
      df_payoffs <- as.data.frame(matrix("", nrow = nr, nc = n_payoffs))
      for (r in 1:nr){
        y[r,2] <- paste0("c(", toString( with(params, eval(parse(text=input_string[r,2])))), ")")
        a <- as.character(input_string[r,3])
        a1 <- unlist(strsplit(a, split=","))
        a2 <- gsub("[)]", "", a1)
        a2[1] <- paste0(strsplit(a2[1], split="")[[1]][-c(1:2)], collapse="")
        a3 <- strsplit(a2, ";")
        a4 <- data.frame(matrix(unlist(a3), nrow=length(a3), byrow=T))
        a5 <- apply(a4, 2, function(x){toString(with(params, eval(x)))})
        a6 <- as.data.frame(as.matrix(a5))
        a7 <- apply(a6, 1, function(x){paste0("c(", x, ")")})
        for (j in 1:n_payoffs) {
        df_payoffs[r, j] <- paste0("c(", toString( with(params, eval(parse(text=a7[j])))), ")")
        }
      }
      y <- y[,-3]
      for (i in 1:n_payoffs) {
        y[, paste0("v_payoff", i)] <- df_payoffs[,i]
      }
    }
  }
   else if (treetype == "markov"){
    nr = nrow(input_string)
    nc = ncol(input_string)
    y <- matrix(0, nrow = nr, ncol = nc)
    for (r in 1:nr){
      for (c in 1:nc){
        y[r,c] <- with(params, eval(parse(text=input_string[r,c])))
      }
    }
  }
  return(y)
}

#' eval_num
#' \code{eval_num} extracts the numeric component of the evaluated model output
#'
#' @param x a character string of numbers
#' @return a vector of numbers
#'
#' @export
#'
eval_num <-function(x) {
  eval(parse(text=x))
}
