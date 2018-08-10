import blue from '@material-ui/core/colors/blue';
import indigo from '@material-ui/core/colors/indigo';
import deepPurple from '@material-ui/core/colors/deepPurple';
import { createMuiTheme } from '@material-ui/core/styles'; 

const theme = createMuiTheme({
  palette: {
    divider: blue.main,
    primary: blue, 
    secondary: indigo, 
  },
}); 

export default theme;