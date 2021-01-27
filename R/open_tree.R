##************************************************************************
## Script Name: open_tree(dirname)
## Purpose:
##
##
## Created: 2021-01-25
## Authors:
##
## GitHub: DARTH-git
##
##
##************************************************************************

#' open_tree
#' \code{open_tree}
#'
#' @param file_name name of the file
#' @param dir_name directory to save the file to
#' @return opens OpenTree
#'
#' @export
open_tree <- function(file_name, dir_name) {
  # Mandatory libraries -------------------------------------------------------
  require(readr)
  require(rstudioapi)

  # Define app directory --------------------------------------------------------
  appDir <- system.file("myapp/instances/open_tree", package = "OpenTree")
  dir_name_aux <- paste0(dir_name, "/", file_name, ".json")

  # Global Variable --------------------------------------------------------
  #dirname; will help to connectopen_tree() with the shiny application
  assign("dir_name", dir_name_aux, envir = .GlobalEnv)
  assign("file_name", file_name, envir = .GlobalEnv)

  # Check path of appDir  ---------------------------------------------------
  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `OpenTree`.", call. = FALSE)
  }

  # Run in the background ---------------------------------------------------
  path_backg <- paste0(appDir, "/shiny-run.R")
  jobRunScript(path_backg, importEnv = TRUE)
}
