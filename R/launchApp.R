launch_app <- function(fileName = "HelloWorld"){
  shinyOptions(fileName = fileName)
  appDir <- system.file("myapp/app.R", package = "OpenTree")
  source(system.file("app.R", package = "OpenTree", local = TRUE, chdir = TRUE))$value
}
