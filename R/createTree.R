##************************************************************************
## Script Name: Create Tree Function
## Purpose:
##
##
## Created:
## Authors:
##
## GitHub: marianafdz465
##
##
##************************************************************************
#' createTree
#' \{createTree} Deploy shiny app
#'
#' @param
#' @return
#' Interface with the json file inside the directory output
#' @export
createTree <- function(fileName, dir_name, libpath) {
  require(rstudioapi)
  #fileName <- fileName
  #dir_name <- dir_name

  appDir <- system.file("myapp", package = "OpenTree")
  #path_aux <- file.path(wd, paste0(fileName, ".json"))
  #path_aux <- paste0(dir_name, "/", fileName, ".json")
  # paste0(dir_name, "/", fileName, ".json")
  assign("path_file2", paste0(dir_name, "/", fileName, ".json"), envir = .GlobalEnv)

  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `OpenTree`.", call. = FALSE)
  }
  #shiny::runApp(appDir, display.mode = "normal")
  # jobRunScript("inst/myapp/shiny-run.R", importEnv = TRUE)
  jobRunScript(paste0(libpath, "/OpenTree/myapp/shiny-run.R"), importEnv = TRUE)
  #path_aux2 <- paste0(appDir, "/shiny-run.R")
  #source(path_aux2)
  # return(path_aux)
}




