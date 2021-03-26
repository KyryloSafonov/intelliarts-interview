import React, {useEffect, useState} from 'react'
import DateFnsUtils from '@date-io/date-fns';
import './App.css';
import {Button, Input, InputLabel, MenuItem, Select, TextField, withMobileDialog} from "@material-ui/core";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import {API_KEY} from "./services/API_KEY/API_KEY";

const actions = [
    {
        id: 1,
        type: 'add',
    },
    {
        id: 2,
        type: 'list',
    },
    {
        id: 3,
        type: 'clear',
    },
    {
        id: 4,
        type: 'total',
    },
]

const groupBy = key => array =>
  array.reduce((objectsByKeyValue, obj) => {
      const value = obj[key];
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
  }, {});

function App() {

    const [listForRender, setListForRender] = React.useState([])
    const [list, setList] = React.useState([])
    const [action, setAction] = React.useState('');
    const [date, setDate] = React.useState('');
    const [price, setPrice] = React.useState('');
    const [currency, setCurrency] = React.useState('');
    const [selectedCurrency, setSelectedCurrency] = React.useState('');
    const [totalAmount, setTotalAmount] = React.useState({});
    const [product, setProduct] = React.useState('');

    const handleAction = (event) => {
        setAction(event.target.value)
    }

    const handleDate = (event) => {
        setDate(event.target.value)
    }

    const handlePrice = (event) => {
        setPrice(event.target.value)
    }

    const handleCurrency = (event) => {
        setSelectedCurrency(event.target.value)
    }

    const handleProduct = (event) => {
        setProduct(event.target.value)
    }


    useEffect(() => {
        const getCurrencies = async () => {
            const resp = await fetch(`http://data.fixer.io/api/latest?access_key=${API_KEY}`)
            const data = await resp.json()
            const currencyCodes = Object.keys(data.rates)
            const arrForSelect = currencyCodes.map((el) => ({key: el}))
            setCurrency(arrForSelect)
        }
        getCurrencies()
    }, [setCurrency])
    const checkCommand = () => {
        if (action) {
            if (action === 'add') {
                setListForRender([])
                setTotalAmount({})
                const newItem = {
                    date: date,
                    price: price,
                    currency: selectedCurrency,
                    product: product
                }
                setList((prevValue) => ([...prevValue, newItem]))
            }

            if (action === 'list') {
                const groupByDate = groupBy('date')
                const groupedList = groupByDate(list)
                setListForRender(groupedList)
            }

            if (action === 'clear') {
                const filteredList = list.filter((el) => el.date !== date)
                setList(filteredList)
                setListForRender([])
            }

            if (action === 'total') {
                const totalAmount = list.reduce((acc, curr) => acc + Number(curr.price), 0)
                const converter = async () => {
                    const convertRequest = await fetch(`https://api.exchangerate.host/convert?from=${list[0].currency}&to=${selectedCurrency}&amount=${totalAmount}`)
                    const resp =  await convertRequest.json()
                    setTotalAmount(resp)
                }
                converter()
            }
        }
    }


    return (
        <div className="App">
            <div className={'App_block'}>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={action}
                    onChange={handleAction}
                >
                    {actions.map((el) => <MenuItem key={el.id} value={el.type}>{el.type}</MenuItem>)}
                </Select>
                {(action === 'add' || action === 'clear') && (
                    <TextField
                        id="date"
                        type="date"
                        onChange={handleDate}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                )}
                {action === 'add' && (
                    <Input onChange={handlePrice} value={price}/>
                )}
                {(action === 'add' || action === 'total') && (
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedCurrency}
                        onChange={handleCurrency}
                    >
                        {currency && currency.map((el) => <MenuItem key={el.key} value={el.key}>{el.key}</MenuItem>)}
                    </Select>
                )}
                {action === 'add' && (
                    <Input onChange={handleProduct} value={product}/>

                )}

                <Button color='primary' onClick={checkCommand} variant={"contained"}>Send</Button>
            </div>
            <div>
                {Object.keys(listForRender).map((el) =>{
                    return <div>
                        <div className='date'>Date: {el}</div>
                        <div>{
                            listForRender[el].map(({date, price, currency, product}) => {
                                return <div className='list'>{date} - {price} - {currency} - {product}</div>
                            })
                        }</div>
                    </div>
                } )}
            </div>
            <div>{
                totalAmount.result? <div className='total'>{totalAmount.query.to} - {totalAmount.result}</div> : ''
            }</div>

        </div>
    );
}

export default App;
