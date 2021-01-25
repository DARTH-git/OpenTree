##************************************************************************
## Script Name: Open Tree Function
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
openTree <- function(dirname, libpath) {
  require(rstudioapi)
  require(readr)
  appDir <- system.file("myapp", package = "OpenTree")
  assign("dirname", dirname, envir = .GlobalEnv)

  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `OpenTree`.", call. = FALSE)
  }

  jobRunScript(paste0(libpath, "/OpenTree/myapp/shiny-run.R"), importEnv = TRUE)

}
