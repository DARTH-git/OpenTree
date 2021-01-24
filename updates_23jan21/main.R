source("opentree_functions.R")

# ========= RUN =========
# define a model name
treeName <- "test1" # placeholdername for model ... use the File commands on OpenTree to create NEW, Open or Save OpenTrees.
# 1. open the UI and create/modify your tree
runOpenTreeUI() #runs the OpenTreeUI
# 2. convert the tree into a summary dataframe
opentree_df <- create_OpenTree_df(treeName)

# decision tree - Doubilet Example ========
params = list(pDieBiopsy = 0.004,
              pSevBiopsy = 0.01,
              pModBiopsy = 0.03,
              sensBiopsy = 0.95,
              specBiopsy = 0.99,
              pHSE       = 0.4, #overall
              pDieHSE    = .7,
              pSevHSE    = .333,
              pModHSE    = .5,
              fDie       = .37,
              fSev       = .2,
              fMod       = .2,
              pDieNoHSE  = .18,
              pSevNoHSE  = .122,
              pModNoHSE  = .139,
              addProbDie = .004,
              addProbSev = .01,
              addProbMod = .02,
              uDie       = 0,
              uSev       = 0.02,
              uMod       = .8,
              uMld       = 1)

evaluate_string(opentree_df$ev_string[1], params)

opentree_df %>% 
  rowwise() %>% 
  mutate(ev = evaluate_string(ev_string, params))

# Markov Sick-Sicker model example =======
treeName <- "test2" #placeholdername for model ... use the File commands on OpenTree to create NEW, Open or Save OpenTrees.
runOpenTreeUI() #runs the OpenTreeUI

opentree_df <- create_OpenTree_df(treeName)
opentree_df

p_HD    <- 0.005            # probability to die when healthy
p_HS1   <- 0.15          	  # probability to become sick when healthy, conditional on surviving
p_S1H   <- 0.5           	  # probability to become healthy when sick, conditional on surviving
p_S1S2  <- 0.105         	  # probability to become sicker when sick, conditional on surviving
hr_S1   <- 3             	  # hazard ratio of death in sick vs healthy
hr_S2   <- 10            	  # hazard ratio of death in sicker vs healthy 
r_HD    <- - log(1 - p_HD)  # rate of death in healthy
r_S1D   <- hr_S1 * r_HD  	  # rate of death in sick
r_S2D   <- hr_S2 * r_HD  	  # rate of death in sicker
p_S1D   <- 1 - exp(-r_S1D)  # probability to die in sick
p_S2D   <- 1 - exp(-r_S2D)  # probability to die in sicker
              
params <- list()

m_P <- evaluate_string(opentree_df$P_str, params)
m_P
v_s_init <- evaluate_string(opentree_df$p0_str$p0, params)
v_s_init

