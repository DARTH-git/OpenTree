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
#' \{open_tree}
#'
#' @param
#' @return
#'
#' @export
open_tree <- function(dirname) {
  # Mandatory libraries -------------------------------------------------------
  require(readr)
  require(rstudioapi)

  # Define app directory --------------------------------------------------------
  appDir <- system.file("myapp/instances/open_tree", package = "OpenTree")

  # Global Variable --------------------------------------------------------
  #dirname; will help to connectopen_tree() with the shiny application
  assign("dirname", dirname, envir = .GlobalEnv)

  # Check path of appDir  ---------------------------------------------------
  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `OpenTree`.", call. = FALSE)
  }

  # Run in the background ---------------------------------------------------
  path_backg <- paste0(appDir, "/shiny-run.R")
  jobRunScript(path_backg, importEnv = TRUE)
}
