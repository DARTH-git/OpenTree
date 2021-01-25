##************************************************************************
## Script Name: shiny-run
## Purpose: Execute script for the shiny app
##
##
## Created: 2020-09-28
## Authors:
##
## GitHub: DARTH-git
##
##
##************************************************************************

options(shiny.autoreload = TRUE)
appDir <- system.file("myapp/instances/open_tree", package = "OpenTree")
shiny::runApp(appDir, display.mode = "normal", launch.browser = T)

#Set up permanent port
#shiny::runApp(port = 3522)
#shiny::runApp(appDir = "inst/myapp/app.R",port = 3522)
