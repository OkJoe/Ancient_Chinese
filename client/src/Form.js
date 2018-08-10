import React, { Component } from 'react';
import './App.css'; 
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tables from './Tables'; 
import styles from './styles'; 
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Switch from '@material-ui/core/Switch';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close'; 
import Avatar from '@material-ui/core/Avatar';

const dataEmpty = require('./dataEmpty.json'); 

const data = require('./data.json'); 

const inputFields = ['字', '聲母', '韻母', '前冠', '聲幹', '介音', '韻腹', '韻尾', '後附']; 

const inputFieldsWord = ['詞', '發音']; 

const specialConsChars = ['ɕ', 'ɖ', 'ɢ', 'ʰ', 'ɦ', 'ɱ', 'ŋ', 'ɳ', 'ȵ', 'ʃ', 'ʈ', 'ʒ', 'ɣ', 'ʑ', 'ʔ']; 

const specialVowlChars = ['́', '̀', 'ː', 'ɑ', 'ɐ', 'ɛ', 'ɪ', 'ɨ', 'ɔ', 'ɶ', 'ø', 'ʌ', 'ɯ', 'ʏ']; 

var initEdit = {
	字:'', 
	聲母:'', 
	韻母:'', 
	前冠:'', 
	聲幹:'', 
	介音:'', 
	韻腹:'', 
	韻尾:'', 
	後附:'', 
	詞: '', 
	發音: '', 
	義:[], 
	含義:'', 
	注:'', 
	又:[], 
	又含義:'', 
	又注:'', 
	引:[], 
	引含義:'', 
	引注:'', 
	editingField: '', 
}; 

const initialState = {
	value: '', // Form value. 
	result: [], // Result for character search. 
	word: [], // Result for word search. 
	def: null, // Definition of current entry. 
    '開合': '', '韻等': '', // Selected 開合 and 韻等. 
    selected: {cons:'', vowl:''}, // Selected prononciation through tables. 
    defToggleEnabled: true, // A helper var for disable list item button property when clicking the actually button within, used when toggling definition list from selected character or word list item. 
    isSearchWord: false,  // Toggle text field character/word search. The default false searches for characters. 
	era: true, 
	editMode: false, 
	noticeOpen: false,
	noticeInfo: '', 
	showPasteBoard: true, 
	inputWord: false, 
	...initEdit
}; 

class Form extends Component {
	constructor(props) {
		super(props);
		
    	this.state = initialState; 
    	
		this.table = React.createRef(); // Reference of Tables.js. 
		
		inputFields.map(n => this[n] = React.createRef()); 
		inputFieldsWord.map(n => this[n] = React.createRef()); 
		['含義', '注', '又含義', '又注', '引含義', '引注'].map(n => this[n] = React.createRef()); 

    	this.handleQuery = this.handleQuery.bind(this); 
    	this.editList = this.editList.bind(this); 
	}
	
	// Handle all the queries, post the type and post information, receive and update information. 
	handleQuery(type, postInfo) { 
		this.setState({value: '', result: [], word: [], def: null}) // Clears the result field. Assume fetch() is slow so it is finished after handleQuery(). 
		
		fetch('/users', {
			method: 'POST',
    		body: JSON.stringify({'type': type, ...postInfo}), 
    		headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
    	})
		.then(res => res.json())
		.then(res => {
			if (type==='wordQuery') {this.setState({word: res, def: res.length===1 ? JSON.parse(res[0].義) : null})} 
			else if (type==='charQuery' || type==='pronQuery') {this.setState({result: res, def: res.length===1 ? JSON.parse(res[0].義) : null})} 
			else if (type==='charSubmit') {this.setState({noticeOpen: true, noticeInfo: res.text, ...initEdit})}
		});
	}
	
	// List of definitions for edit mode. 
	editList(opt, submit) {
		return <div>
			<div style={{display: 'flex'}}>
				<Avatar>{opt}</Avatar>
			</div>
			
			<List>
				{this.state[opt].map((def, i) => (
					<ListItem dense divider>
						<ListItemText primary={def.文} secondary={def.注} />
							
						{(def.又 || []).map(def => 
							<ListItemText primary={def.文} secondary={"【又】"+(def.注 || "")} />
						)}
							
						{(def.引 || []).map(def => 
							<ListItemText primary={def.文} secondary={"【引】"+(def.注 || "")} />
						)}
										
						{i>0 &&
							<Button onClick={e => this.setState(prevState => ({
								[opt]: [...prevState[opt].slice(undefined, i-1), prevState[opt][i], prevState[opt][i-1], ...prevState[opt].slice(i+1)], 
							}))}>
								前移
							</Button>
						}
										
						{i<this.state.義.length-1 &&
							<Button onClick={e => this.setState(prevState => ({
								[opt]: [...prevState[opt].slice(undefined, i), prevState[opt][i+1], prevState[opt][i], ...prevState[opt].slice(i+2)], 
							}))}>
								後移
							</Button>
						}
										
						<Button onClick={e => {
							this.setState(prevState => ({
								[opt]: [...prevState[opt].slice(undefined, i), ...prevState[opt].slice(i+1)], 
							})); 
							this['含義'].current.focus(); 
						}}>
							刪除此義
						</Button>
					</ListItem>
				))}
				<ListItem dense divider>
					<TextField
						label='含義' 
						value={this.state[(opt=='義' ? '' : opt)+'含義']} 
						inputRef={this[(opt=='義' ? '' : opt)+'含義']}
						onChange={e => this.setState({[(opt=='義' ? '' : opt)+'含義']: e.target.value})}
						onKeyDown={(e) => {
							if (e.key==='Enter') {submit(); this['含義'].current.focus(); }
							else if (e.key==='ArrowUp') {this[{'義':'含義', '又':'含義', '引':'又含義'}[opt]].current.focus()}
							else if (e.key==='ArrowDown') {this[{'義':'又含義', '又':'引含義', '引':'引含義'}[opt]].current.focus()}
							else if (e.key==='ArrowRight') {this[{'義':'注', '又':'又注', '引':'引注'}[opt]].current.focus()}
						}}
					/>
					<TextField
						label='注' 
						value={this.state[(opt=='義' ? '' : opt)+'注']} 
						inputRef={this[(opt=='義' ? '' : opt)+'注']}
						onChange={e => this.setState({[(opt=='義' ? '' : opt)+'注']: e.target.value})}
						onKeyDown={(e) => {
							if (e.key==='Enter') {submit(); this['含義'].current.focus(); }
							else if (e.key==='ArrowUp') {this[{'義':'注', '又':'注', '引':'又注'}[opt]].current.focus()}
							else if (e.key==='ArrowDown') {this[{'義':'又注', '又':'引注', '引':'引注'}[opt]].current.focus()}
							else if (e.key==='ArrowLeft') {this[{'義':'含義', '又':'又含義', '引':'引含義'}[opt]].current.focus()}
						}}
					/>
					<Button onClick={e => {submit(); this['含義'].current.focus(); }}>
						添加此義
					</Button>
				</ListItem>
			</List>
		</div>; 
	}
	
	render() {
		const searchFieldAndQueryButton = 
			<Paper style={{...styles.paper, ...{justifyContent: 'center'}}}>
				<div style={{width: '40%'}}>
					<TextField
						label='Search' 
						value={this.state.value} 
						onChange={e => this.setState({value: e.target.value})}
						onKeyPress={(e) => {e.key==='Enter' ? 
							this.handleQuery(
								(this.state.isSearchWord ? 'wordQuery' : 'charQuery'), 
								{'value': (this.state.value==='' ? 'Empty':this.state.value), 'initOnly': false}
							) : () => {}
						}}
					/>
					<Switch 
						checked={this.state.isSearchWord} 
						onChange={(e, value) => this.setState({isSearchWord: value})} 
						color='primary'
					/>
				</div>
				<div style={{width: '40%'}}>
					<FormControl fullWidth margin="normal">
						<Chip
        					label={'Query:  '+this.state.selected.cons+this.state.selected.vowl}
        					margin="normal"
        					onClick={e => this.handleQuery('pronQuery', {'cons': this.state.selected.cons, 'vowl': this.state.selected.vowl})}
						/>
					</FormControl>
				</div>
			</Paper>; 
		
		const listOfChar = 
			<Paper>
				<List>
					{this.state.result.map(res => (
						<ListItem dense divider onClick={e => {
							this.state.defToggleEnabled &&
								(this.state.def===null
									? this.setState({word: [], def: JSON.parse(res.義)})
									: this.setState({word: [], def: null})
								)
							
						}}>
							<ListItemText primary={res.字} secondary={this.state.era ? (res.聲母+res.韻母) : (res.前冠+res.聲幹+res.介音+res.韻腹+res.韻尾+res.後附)} />
							
							<Button
								onMouseOver={e => this.setState({defToggleEnabled: false})}
								onMouseLeave={e => this.setState({defToggleEnabled: true})}
								onClick={e => {var x = !this.state.era; this.setState({era: x}); }}
							>
							</Button>
							
							<Button
								onMouseOver={e => this.setState({defToggleEnabled: false})}
								onMouseLeave={e => this.setState({defToggleEnabled: true})}
								onClick={e => this.handleQuery('wordQuery', {'value': res.字.slice(0,1), 'initOnly': true})}
							>
							</Button>
							
							<Button
								onMouseOver={e => this.setState({defToggleEnabled: false})}
								onMouseLeave={e => this.setState({defToggleEnabled: true})}
								onClick={e => this.handleQuery('wordQuery', {'value': res.字.slice(0,1), 'initOnly': false})}
							>
							</Button>
							
						</ListItem>
					))}
				</List>
			</Paper>; 
			
		const listOfWord = 
			<Paper>
				<List>
					{this.state.word.map(res => (
						<ListItem dense divider 
							onClick={e => {
							this.state.def===null
								? this.setState({def: JSON.parse(res.義)})
								: this.setState({def: null})
							}}
						>
							<ListItemText primary={res.詞} secondary={res.發音} />
						</ListItem>
					))}
				</List>
			</Paper>; 
		
		const listOfDef = 
			<Paper>
				<List>
					{(this.state.def || []).map(def => (
						<ListItem dense divider>
							<ListItemText primary={def.文} secondary={def.注} />
							
							{(def.又 || []).map(def => 
								<ListItemText primary={def.文} secondary={"【又】"+(def.注 || "")} />
							)}
							
							{(def.引 || []).map(def => 
								<ListItemText primary={def.文} secondary={"【引】"+(def.注 || "")} />
							)}
						</ListItem>
					))}
				</List>
			</Paper>; 
		
		const selectionOfPron = 
			<Paper style={{paddingBottom: '4px', ...styles.paper}}>
				{[
					{label: '開合', items: [
						{value: '開', text: '開口'}, 
						{value: '合', text: '合口'}
					]}, 
					{label: '韻等', items: [
						{value: '一', text: '一等'}, 
						{value: '二', text: '二等'}, 
						{value: '三', text: '三等'}, 
						{value: '四', text: '四等'}
					]}
				].map(n =>
					<div style={{width: '50%'}}>
						<FormControl fullWidth margin="dense">
							<InputLabel htmlFor={n.label}>{n.label}</InputLabel>
								<Select
									value={this.state[n.label]}
									onChange={(e) => {this.setState({[n.label]: e.target.value}); this.table.current.reinit(); }}
									inputProps={{id: n.label}}
								>
									{n.items.map(m => 
										<MenuItem value={m.value}>{m.text}</MenuItem>
									)}
							</Select>
						</FormControl>
					</div>
				)}
			</Paper>; 
			
		const editHeader = 
			<div style={{display: 'flex'}}>
				{this.state.inputWord
					? 
						<span>
							<Chip label={"詞："+this.state.詞} />
							<Chip label={"發音："+this.state.發音} />
						</span>
					: 
						<span>
							<Chip label={"字："+this.state.字} />
							<Chip label={"中古："+this.state.聲母+this.state.韻母} />
							<Chip label={"上古："+this.state.前冠+this.state.聲幹+this.state.介音+this.state.韻腹+this.state.韻尾+this.state.後附} />
						</span>
				}
				
				<Button 
					variant="outlined" 
					color="secondary" 
					onClick={e => {if ((this.state.inputWord && this.state.詞!=='') || (!this.state.inputWord && this.state.字!==''))
						{this.handleQuery('charSubmit', {'command': 
							(this.state.inputWord
								? ("INSERT INTO `詞` (`詞`, `發音`, `義`) VALUES ('"+this.state.詞+"', '"+this.state.發音+"', '"+JSON.stringify(this.state.義)+"');").replace(new RegExp('"', 'g'), '\\"')
								: ("INSERT INTO `字` (`字`, `聲母`, `韻母`, `前冠`, `聲幹`, `介音`, `韻腹`, `韻尾`, `後附`, `義`, `isRegistered`) VALUES ('"+this.state.字+"', '"+this.state.聲母+"', '"+this.state.韻母+"', '"+this.state.前冠+"', '"+this.state.聲幹.replace(new RegExp("'", 'g'), "\\'")+"', '"+this.state.介音.replace(new RegExp("'", 'g'), "\\'")+"', '"+this.state.韻腹+"', '"+this.state.韻尾+"', '"+this.state.後附+"', '"+JSON.stringify(this.state.義)+"', '0');").replace(new RegExp('"', 'g'), '\\"')
							)
						})
						}
					
						else {this.setState({noticeOpen: true, noticeInfo: "Submission failed: the '"+(this.state.inputWord ? '詞' : '字')+"' field cannot be empty! "})}
						
						this[this.state.inputWord ? '詞' : '字'].current.focus(); 
					}}
				>
					Submit
				</Button>
				
				<Button 
					variant="outlined" 
					color="secondary" 
					onClick={e => this.setState(initEdit)}
				>
					Clear
				</Button>
				
				{!this.state.showPasteBoard &&
					<Button 
						variant="outlined" 
						color="secondary" 
						onClick={e => this.setState({showPasteBoard: true})}
					>
						Special Chars
					</Button>
				}
				
				<Switch 
					checked={this.state.inputWord} 
					onChange={(e, value) => this.setState({inputWord: value, ...initEdit})} 
					color='secondary'
				/>
			</div>; 
		
		const charPasteBoard = 
			<div>
				<div style={{display: 'flex'}}>
					<Chip label='Special Characters' />
					
					<Button onClick={e => this.setState({editingField: ''})} >
					</Button>
					
					<Button onClick={e => this.setState({showPasteBoard: false})}>
					</Button>
				</div>
				
				<div style={{display: 'flex'}}>
					{/*<Chip label='Consonants' />*/} 
					{specialConsChars.map(n => 
						<Avatar 
							onClick = {e => {if (this.state.editingField!=='') {this[this.state.editingField].current.focus(); this.setState(p => ({[p.editingField]: p[p.editingField]+n})); }}}
						>
							{n}
						</Avatar>
					)}
				</div>
				
				<div style={{display: 'flex'}}>
					{/*<Chip label='Vowels' />*/} 
					{specialVowlChars.map(n => 
						<Avatar 
							onClick = {e => {if (this.state.editingField!=='') {this[this.state.editingField].current.focus(); this.setState(p => ({[p.editingField]: p[p.editingField]+n})); }}}
						>
							{n}
						</Avatar>
					)}
				</div>

			</div>; 
		
		const inputTextFields = 
		<div>
		{this.state.inputWord &&
			<div style={{paddingBottom: '4px', display: 'flex'}}>
				{inputFieldsWord.map((n, i) => 
					<TextField
						autoFocus={(i===0)}
						label={n} 
						value={this.state[n]} 
						onChange={e => this.setState({[n]: e.target.value})}
						onFocus={e => this.setState({editingField: n})} 
						onKeyPress={(e) => {
							if (e.key==='Enter') {
								i<(inputFieldsWord.length-1) 
									? this[inputFieldsWord[i+1]].current.focus() 
									: this['含義'].current.focus() 
							}
						}}
						inputRef={this[n]}
					/>
				)}
			</div>
			}
			{!this.state.inputWord &&
			<div style={{paddingBottom: '4px', display: 'flex'}}>
				{inputFields.map((n, i) => 
					<TextField
						autoFocus={(i===0)}
						label={n} 
						value={this.state[n]} 
						onChange={e => this.setState({[n]: e.target.value})}
						onFocus={e => this.setState({editingField: n})} 
						onKeyPress={(e) => {
							if (e.key==='Enter') {
								i<(inputFields.length-1) 
									? this[inputFields[i+1]].current.focus() 
									: this['含義'].current.focus() 
							}
						}}
						inputRef={this[n]}
					/>
				)}
			</div>
			}
			</div>; 
		
		const submitSuccessBar = 
			<Snackbar
				anchorOrigin={{
            		vertical: 'bottom',
            		horizontal: 'left',
          		}}
          		open={this.state.noticeOpen}
          		autoHideDuration={30000}
          		onClose={()=>this.setState({noticeOpen: false, noticeInfo: ''})}
          		ContentProps={{
            		'aria-describedby': 'message-id',
          		}}
          		message={<span id="message-id">{this.state.noticeInfo}</span>}
          		action={[
            		<IconButton
              			key="close"
              			aria-label="Close"
              			color="inherit"
              			onClick={()=>this.setState({noticeOpen: false, noticeInfo: ''})}
            		>
            			<CloseIcon />
            		</IconButton>,
          		]}
        	/>; 
	
		return (
			<Grid container spacing={24}>
				<Grid item xs={6} sm={6}>
					{searchFieldAndQueryButton}
					
					{this.state.result.length>0 && listOfChar}
					
					{this.state.word.length>0 && listOfWord}
					
					{this.state.def!==null && listOfDef}
				</Grid>
				<Grid item xs={6} sm={6}> 
					{this.state.editMode 
						? 
							<div>
								{submitSuccessBar} 
								
								{editHeader}
							
								{this.state.showPasteBoard && charPasteBoard}
							
								{inputTextFields} 

								{this.editList('義', e => {if (this.state.含義!=='' || this.state.注!=='') {
									this.setState(prevState => ({
										義: [...prevState.義, {
											...(prevState.含義!=='' && {'文':prevState.含義}), 
											...(prevState.注!=='' && {'注':prevState.注}), 
											...(prevState.又.length>0 && {'又':prevState.又}), 
											...(prevState.引.length>0 && {'引':prevState.引})
										}], 
										含義: '', 
										注:'', 
										又:[], 
										又含義:'', 
										又注:'', 
										引:[], 
										引含義:'', 
										引注:'', 
									}))
								}})}
							
							
								{this.editList('又', e => {if (this.state.又含義!=='' || this.state.又注!=='') {
									this.setState(prevState => ({
										又: [...prevState.又, {
											...(prevState.又含義!=='' && {'文':prevState.又含義}), 
											...(prevState.又注!=='' && {'注':prevState.又注})
										}], 
										又含義: '', 
										又注:'', 
									}))
								}})}
									
								{this.editList('引', e => {if (this.state.引含義!=='' || this.state.引注!=='') {
									this.setState(prevState => ({
										引: [...prevState.引, {
											...(prevState.引含義!=='' && {'文':prevState.引含義}), 
											...(prevState.引注!=='' && {'注':prevState.引注})
										}], 
										引含義: '', 
										引注:'', 
									}))
								}})}
							</div>
							
						: 
							<div>
								{selectionOfPron}
					
								<Tables 
									data={(data[this.state.開合] || {})[this.state.韻等] || {rows: [], cols: []}}
									ref={this.table}
									onClick={e => this.setState({selected: {cons:this.table.current.state.cons, vowl:this.table.current.state.vowl}})}
								/>
					
								{/* Hidden button to reset tables. */}
								<FormControl fullWidth margin="dense">
									<Button onClick={e => {this.setState({selected: {cons:'', vowl:''}, 開合: '', 韻等: ''}); this.table.current.reinit(); }}>
									</Button>
								</FormControl>
							</div>
					}
					
					{/* Hidden button to toggle edit mode. */}
					<FormControl fullWidth margin="dense">
						<Button onClick={e => {var temp = !this.state.editMode; this.setState({selected: {cons:'', vowl:''}, 開合: '', 韻等: '', editMode: temp}); }}>
						</Button>
					</FormControl>
				</Grid>
			</Grid>
		);
	}
}

export default Form; 