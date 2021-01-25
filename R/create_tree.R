##************************************************************************
## Script Name: Create Tree Function
## Purpose:
##
##
## Created:
## Authors:
##
## GitHub: DARTH-git
##
##
##************************************************************************

#' create_tree
#' \{create_tree}
#'
#' @param
#' @return
#'
#' @export
#'
create_tree <- function(fileName, dirname) {
  # Mandatory libraries -------------------------------------------------------
  require(rstudioapi)

  # Define app directory --------------------------------------------------------
  appDir <- system.file("myapp/instances/create_tree", package = "OpenTree")

  # Global Variable --------------------------------------------------------
  #dir_name; will help to connect create_tree() with the shiny application
  path_file <- paste0(dirname,"/", fileName, ".json")
  assign("path_file", path_file, envir = .GlobalEnv)
  assign("dirname", dirname, envir = .GlobalEnv)

  # Check path of appDir  ---------------------------------------------------
  if (appDir == "") {
    stop("Could not find myapp. Try re-installing `OpenTree`.", call. = FALSE)
  }

  # Run in the background ---------------------------------------------------
  path_backg <- paste0(appDir, "/shiny-run.R")
  jobRunScript(path_backg, importEnv = TRUE)
  return(path_file)

}


# createTree <- function(fileName, dir_name, libpath) {
#   require(rstudioapi)
#
#   appDir <- system.file("myapp", package = "OpenTree")
#   #path_aux <- file.path(wd, paste0(fileName, ".json"))
#   #path_aux <- paste0(dir_name, "/", fileName, ".json")
#   # paste0(dir_name, "/", fileName, ".json")
#   assign("path_file2", paste0(dir_name, "/", fileName, ".json"), envir = .GlobalEnv)
#
#   if (appDir == "") {
#     stop("Could not find myapp. Try re-installing `OpenTree`.", call. = FALSE)
#   }
#   #shiny::runApp(appDir, display.mode = "normal")
#   # jobRunScript("inst/myapp/shiny-run.R", importEnv = TRUE)
#   jobRunScript(paste0(libpath, "/OpenTree/myapp/shiny-run.R"), importEnv = TRUE)
#   #path_aux2 <- paste0(appDir, "/shiny-run.R")
#   #source(path_aux2)
#   # return(path_aux)
# }
#



