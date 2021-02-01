##************************************************************************
## Script Name: Instance app for open_tree function
## Purpose:
##
##
## Created: 2021-01-18
## Authors:
##
## GitHub: DARTH-git
##
##
##************************************************************************

library(shiny)
library(readr)

# UI ----------------------------------------------------------------------

ui <- htmlTemplate("www/OpenTree.html",
                   #text_input = textInput("fname","File name: ",value="OpenTree.csv"),
                   #verb_output = verbatimTextOutput("text"),
                   #btn1_checker = actionButton("chck1_file", "Check for file"),
                   #Data Table
                   #data_table = tableOutput("table1"),
                   text_title = textOutput("title"),
                   # text output
                   text_output = tableOutput("table2")
)

# Server ------------------------------------------------------------------

server <-  function(input, output, session){
  #File Name text
  output$title <- renderText({
    file_name
  })
  # First Message
  message <- paste0("Warning: any changes to the tree structure will be automatically saved to ", dir_name ,  " in real-time.", "\n \n" , "To avoid losing work, please make sure to make a copy of ", file_name,  " before proceeding.")
  # send the message to the event handler with name handler1
  session$sendCustomMessage("handler1", message)

  #Read json file
  jsonData <- read_file(dir_name)
  session$sendCustomMessage("jsonData", jsonData)

  # This block fires each time we receive a message from JavaScript
  output$table2 <- renderTable({
    #Write csv

    #write.csv(value,setfname)
    # value = input$jsValue
    # write.csv(value, paste0("reactiveObjects/OpenTree_", fileName,".csv"))

    #Write json
    json_value = input$jsonData
    write(json_value, dir_name)
  })

}


# Run the app -------------------------------------------------------------
shinyApp(ui , server)




