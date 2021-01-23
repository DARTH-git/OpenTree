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
openTree <- function(fileName) {

  fileName <<- fileName
  appDir <- system.file("myapp/examples/02", package = "OpenTree")

  wd <- getOption("wd")
  path_aux <- file.path(wd, paste0(fileName, ".json"))
  assign("path_file", path_aux, envir = .GlobalEnv)

  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `mypackage`.", call. = FALSE)
  }

  shiny::runApp(appDir, display.mode = "normal")
  return(fileName)

}
