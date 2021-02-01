##************************************************************************
## Script Name: App Instance for create_tree(fileName, dirname) function
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
    message <- paste0("OpenTree will save your changes to the tree structure in real-time to ", path_file)

    # send the message to the event handler with name handler1
    session$sendCustomMessage("handler1", message)

    # This block fires each time we receive a message from JavaScript
    output$table2 <- renderTable({
        #Write csv
        # value = input$jsValue
        # write.csv(value, paste0("reactiveObjects/OpenTree_", fileName,".csv"))

        #Write json file
        json_value = input$jsonData
        write(json_value, path_file)

    })


}

# Run the application -----------------------------------------------------
shinyApp(ui , server)

