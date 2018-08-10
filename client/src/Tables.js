import React from 'react';
import TableModule from './tableModule'; 
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab'; 
import styles from './styles'; 

const accents = ["平", "上", "去", "入"]; 
const 重紐 = ["重紐三等", "重紐四等"]; 

const initialState = {
	rows: [], // Store a array of consonant objects for the second table. 
	cols: [], // Store a array of vowel objects for the second table. 
	data: [[[]]], // Store the data for the second table, whose entry is {"items": ARRAY} an array of vowel strings for the tab. 
	
	重紐Data : [], // Store data for 重紐 selection tab to display. 
	select重紐Id: -1, 
	
	cons:'', // Store the consonant name selected by the second table. Needed by Form.js for query purpose. 	
	vowl:'', // Store the vowel as selected by the tab. Needed by Form.js for query purpose. 
	
	tabData: [], // Store the array of data for the tab to display. 
}; 

class Tables extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = initialState; 
		
		this.first = React.createRef(); // Reference for the first table. 
		this.second = React.createRef(); // Reference for the second table. 

		this.renderSecond = this.renderSecond.bind(this);
		this.select重紐 = this.select重紐.bind(this); 
		this.renderTab = this.renderTab.bind(this);
		this.select = this.select.bind(this);
		this.reinit = this.reinit.bind(this);
	}
	
	// Reinitialize the tables and the tab as 開合 and 韻等 changes in the Form.js. 
	reinit() {
		this.setState(initialState); 
		this.first.current.reinit(); 
		this.second.current.reinit(); 
	}
	
	// Set this.state.rows/cols/data for the second table or 重紐 tab to render. 
	renderSecond() {
		if (this.first.current !== null) {
		this.second.current.reinit(); 
		this.first.current.state.selected.data[0]==='重紐'
			? this.setState({
				rows: [], 
				cols: [], 
				data: [[[]]], 
				cons:'', 
				vowl:'', 
				tabData: [], 
				重紐Data: this.first.current.state.selected.data, 
				select重紐Id: -1, 
			}, this.props.onClick) 
			: this.setState({
				cons:'', 
				vowl:'', 
				tabData: [], 
				rows: this.first.current.state.selected.row[1], 
				cols: this.first.current.state.selected.col[1], 
				data: this.first.current.state.selected.data, 
				重紐Data: [], 
				select重紐Id: -1, 
			}, this.props.onClick) 
		}
	}
	
	// Set rows, cols, and data for the second table when 重紐 selection is made. 
	select重紐(e, id) {
		this.second.current.reinit(); 
		this.setState({
			rows: this.first.current.state.selected.row[1], 
			cols: this.first.current.state.selected.col[2][id], 
			data: this.first.current.state.selected.data[id+1], 
			cons:'', 
			vowl:'', 
			tabData: [], 
			select重紐Id: id, 
		}, this.props.onClick); 
	}
	
	// Set this.state.cons/vowlStem/their id for the tab to display. 
	renderTab(e) {
		this.setState({
			cons:'', 
			vowl:'', 
			tabData: this.second.current.state.selected.data
		}, this.props.onClick); 
	}
	
	// Select this.state.cons by the tab. This is where Tables.props.onClick is called for Form.js to collect selected data for query. 
	select(e, value) {
		this.setState(
			{
				cons:(this.second.current.state.selected.row[0] || ''), 
				vowl: value
			}, this.props.onClick
		); 
	}
	
	render() {return(
		<div>
			{/* The first table. */}
			<Paper>
				<TableModule data={this.props.data} title={['聲組', '主韻']} ref={this.first} onClick={this.renderSecond} />
			</Paper>
			
			{/* The 重紐 tab. */}
			{this.state.重紐Data.length>0 &&
				<Paper>
					<Tabs
        				value={this.state.select重紐Id}
        				onChange={this.select重紐}
        				fullWidth
        				indicatorColor='primary'
        				textColor='primary'
    				>	
    					{this.state.重紐Data.slice(1).map((n, id) => 
    						<Tab style={styles.tab} value={id} label={重紐[id] || this.first.current.state.selected.col[2][id][0][0]} disabled={!n}/>
    					)}
        			</Tabs>
				</Paper>
			}
			
			{/* The second table. */}
			<Paper>
				<TableModule data={this.state} title={['聲母', '韻母']} ref={this.second} onClick={e => this.renderTab(e)} />
			</Paper>
			
			{/* The tab, displayed when this.state.id is valid and in use. */}
			{this.state.tabData.length>0 &&
				<Paper>
					<Tabs
        				value={this.state.vowl}
        				onChange={this.select}
        				fullWidth
        				indicatorColor='primary'
        				textColor='primary'
    				>	
    					{this.state.tabData.map((n, id) => 
    						<Tab style={styles.tab} value={n} label={accents[id]} disabled={!n}/>
    					)}
        			</Tabs>
				</Paper>
			}
		</div>
	);}
}

export default Tables;