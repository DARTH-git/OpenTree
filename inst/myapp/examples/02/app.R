##************************************************************************
## Script Name: Instance app for openTree function
## Purpose:
##
##
## Created: 2021-01-18
## Authors:
##
## GitHub:
##
##
##************************************************************************
library(shiny)
library(OpenTree)
library("rjson")

#
readSettings <- function(){
    if (file.exists(fileName)){
        fileName <<- fromJSON(fileName,stringsAsFactors=F)
    }
}

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
  path_file <- file.path(wd, paste0(fileName, ".json"))

  # First Message
  message <- paste0("To avoid lost work, please make sure to back up your file before making new changes ", path_file)

  # send the message to the event handler with name handler1 if we press the action button
  session$sendCustomMessage("handler1", message)
  readSettings()
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
    json_value = read_json(input$file1$datapath, simplifyVector = TRUE)
    #write(json_value, paste0("reactiveObjects/OpenTree_",fileName, ".json"))
    write(json_value, file.path(wd, paste0(fileName, ".json")))
    #write(json_value, paste0(fileName, ".json"))

  })


}


# Run the application
shinyApp(ui , server)




