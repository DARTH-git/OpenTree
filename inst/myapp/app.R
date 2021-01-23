##************************************************************************
## Script Name: App Instance for createTree(fileName) function
## Purpose:
##
##
## Created: 2021-01-18
## Authors:
##
## GitHub: marianafdz465
##
##
##************************************************************************

library(shiny)
library(OpenTree)
library(rstudioapi)



# Test --------------------------------------------------------------------

# readSettings <- function(){
#     if (file.exists(setfname)){
#         settingsdf <<- read.csv(setfname,stringsAsFactors=F)
#     }
# }

# UI ----------------------------------------------------------------------

ui <- htmlTemplate("www/OpenTree.html",
        #text_input = textInput("fname","File name: ",value="OpenTree.csv"),
        #verb_output = verbatimTextOutput("text"),
        #btn1_checker = actionButton("chck1_file", "Check for file"),
        #Data Table
        #data_table = tableOutput("table1"),

        # text output
        text_output = tableOutput("table2")


)



# Server ------------------------------------------------------------------

server <-  function(input, output, session){
    wd <- getOption("wd")
    #path_file <- file.path(wd, paste0(fileName, ".json"))

    # First Message
    message <- paste0("OpenTree will save your changes to the tree structure in real-time to ", path_file)

    # send the message to the event handler with name handler1 if we press the action button
    session$sendCustomMessage("handler1", message)

    # This block fires each time we receive a message from JavaScript
    output$table2 <- renderTable({
        #Write csv

        #print("JAVA SCRIPT LLAMADA")
        #paste("Aquí estoy", input$jsValue)
        #print(value)
        #write.csv(value,setfname)
        # value = input$jsValue
        # write.csv(value, paste0("reactiveObjects/OpenTree_", fileName,".csv"))
        #
       # write.csv(value, paste0("reactiveObjects/OpenTree_", format(Sys.time(), "%d-%b-%Y %H.%M"), ".csv"))


        #Write json file
        json_value = input$jsonData
        #write(json_value, paste0("reactiveObjects/OpenTree_",fileName, ".json"))

        #write(json_value, file.path(wd, paste0(fileName, ".json")))
        write(json_value, path_file)

    })


}


# Run the application
shinyApp(ui , server)

