library(rstudioapi)
#' @export
runExample <- function(fileName) {
  fileName <<- fileName
  appDir <- system.file("myapp", package = "OpenTree")

  path_aux <- paste0(appDir,"/", fileName, ".json")
  assign("path_file", path_aux, envir = .GlobalEnv)

  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `mypackage`.", call. = FALSE)
  }

  shiny::runApp(appDir, display.mode = "normal")
  return(fileName)
  #jobRunScript(path = "inst/myapp/shiny-run.R")
}
