# OpenTree functions

library(tidyverse)
library(jsonlite)
library(rstudioapi)

runOpenTreeUI <- function(){
  #Run shiny app in the background
job_info <-  jobRunScript("shiny-run.R", 
               "OpenTree", 
                importEnv = TRUE) #Relative Path 
  
  # See the tree in the viewer window of RStudio
  rstudioapi::viewer("http://localhost:3522")
  return(job_info)
}

## read and convert JSON file into DF ========
readOpenTreeModel <- function(treeName){
  fileName <- paste0("OpenTree_", treeName, ".json")
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

create_OpenTree_df_decision <- function(df_input, df1){
  
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
    mutate(ev = paste("prod(", prob_chain, ") *", payoff, sep = "")) %>% 
    group_by(decision_id) %>% 
    summarize(ev_string = paste(ev, collapse = "+")) %>% 
    inner_join(dec_names)
  return(df_final)
}

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

evaluate_string <- function(input_string, params){
  if (class(input_string) == "matrix" | class(input_string) == "data.frame"){
    nr = nrow(input_string)
    nc = ncol(input_string)
    y <- matrix(0, nrow = nr, ncol = nc)
    for (r in 1:nr){
      for (c in 1:nc){
        y[r,c] <- with(params, eval(parse(text=input_string[r,c])))
      }
    }
  } else if (length(input_string) > 1){
    ne <- length(input_string)
    y <- rep(0, ne)
    for (i in 1:ne){
      y[i] <- with(params, eval(parse(text=input_string[i])))
    }
  } else if (class(input_string) == "character"){
    y <- with(params, eval(parse(text=input_string)))
  }
  return(y)
}