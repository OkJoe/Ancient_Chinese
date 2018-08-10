import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { MuiThemeProvider } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import theme from './theme'; 
import styles from './styles'; 

const initialState = {
	hovered: {row: ["", []], col: ["", []]}, // The hovered table cell. 
	selected: {row: ["", []], col: ["", []], data: [[]]}, // The selected table cell. 
};

class TableModule extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = initialState;
		
		this.handleMouseLeave = this.handleMouseLeave.bind(this);
		this.handleMouseOver = this.handleMouseOver.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.reinit = this.reinit.bind(this);
	}
	
	reinit() {
		this.setState(initialState); 
	}
	
	render() {
	
		const tableStyle = {
			height: "0px", 
			paddingTop: "7px",
    		paddingBottom: "7px", 
    		paddingLeft: "15px",
			paddingRight: "39px",
		}; 
		
		return (
		
	<MuiThemeProvider theme={theme}>
    	<Paper style={styles.paper}>
    		{/* Display only when the table is non empty. */}
    		{this.props.data.rows.length>0 && 
    			<div>
    				{/* Chips for currently hovered table cell data. */}
    				{[this.state.hovered.row[0], this.state.hovered.col[0]].map((name, i) => 
						<FormControl margin="dense">
							<Chip
								avatar={<Avatar>{name}</Avatar>}
								label={this.props.title[i]}
							/>
						</FormControl>
					)}
					
					{/* The table. */}
	<Table>
        <TableBody>
        	{/* Row of column names. */}
        	<TableRow style={tableStyle}>
        		<TableCell style={{...tableStyle, ...{backgroundColor: this.isHovered({}, {}, 0, 0, false)}}}></TableCell>
            	{this.props.data.cols.map(m => 
					<TableCell style={{...{backgroundColor: this.isHovered({}, m, 0, 0, false)}, ...tableStyle}}>{m[0]}</TableCell>
            	)}
				<TableCell style={tableStyle}/>
			</TableRow>
        
        	{/* Iterate through rows. */}
			{this.props.data.rows.map((n, i) => 
        		<TableRow style={tableStyle}>
        			{/* Row name. */}
            		<TableCell style={{backgroundColor: this.isHovered(n, {}, 0, 0, false), ...tableStyle}}>
            			{n[0]}
            		</TableCell>
            		
            		{/* Row body, iterated through number of columns. */}
            		{this.props.data.cols.map((m, j) => 
            			<TableCell 
            				onMouseLeave={e => this.handleMouseLeave(e)}
                			onMouseOver={e => this.handleMouseOver(e, n, m)}
                			onClick={e => this.handleClick(e, n, m, i, j)}
                			style={{backgroundColor: this.isHovered(n, m, i, j, true), ...tableStyle}}>
						</TableCell>
            		)}
            	</TableRow>
        	)}
        </TableBody>
    </Table>
    			</div>
    		}
		</Paper>
	</MuiThemeProvider>
		
		);
	}

	// Cancel hover status when mouse leave a table cell. 
	handleMouseLeave(e) {
		const copyOfSelected = Object.assign(this.state.selected); 
		this.setState({hovered: copyOfSelected});
	}
	
	// Register hover status when mouse is on a table cell. 
	handleMouseOver(e, row, col) {
		this.setState({hovered: {row: row, col: col}});
	}
	
	// Register selection status when a selection is made on a cell. 
	handleClick(e, row, col, rowId, colId) {
		if (this.props.data.data[rowId][colId].length>0) {
			this.setState({selected: {row: row, col: col, data: this.props.data.data[rowId][colId]}}, this.props.onClick)
		}
	}
	
	// Assign color for a cell depending on hover and selection status. Scheme is false table cells whose entry content is empty. 
	isHovered(row, col, rowId, colId, scheme) { 
		// Set the color scheme according to whether the content is not empty. While assign color if the table cell is selected. 
		var sc = theme.palette.primary; 
		if (scheme) {
			if (!this.props.data.data[rowId][colId].length>0) {sc = theme.palette.secondary} 
			else {
				if (row[0] === this.state.selected.row[0] && col[0] === this.state.selected.col[0]) {
						return sc[900]; 
				}
			}
		} 
		
		// Assign color to rest of the table cells and header cells. 
		var hovered = this.state.hovered; 
		if (row[0] === hovered.row[0]) {
			if (col[0] === hovered.col[0]) {
				return sc[700]; 
			}
			return sc[600]; 
		}
		else if (col[0] === hovered.col[0]) {
			return sc[600]; 
		}
		return sc[500]; 
	}

}

export default TableModule; 