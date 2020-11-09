#
# This is a Shiny web application. You can run the application by clicking
# the 'Run App' button above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)


# Functions for Save DataTable ---------------------------------------------------------------

fileName <- treeName #sprintf("%s_%s.csv", as.integer(Sys.time()), digest::digest(data))

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

server = function(input, output, session){

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
        
        #print("JSON LLAMADA")
        json_value = input$jsonData
        #write(json_value, paste0("reactiveObjects/OpenTree_",fileName, ".json"))
        write(json_value, paste0("OpenTree_",fileName, ".json"))
        
    })
    

}


# Run the application 
shinyApp(ui , server)




