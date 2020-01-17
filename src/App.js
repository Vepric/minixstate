import React, { useState } from 'react';
import './App.css';
import {Machine,assign, interpret} from 'xstate';
import {useMachine} from '@xstate/react'
import { update } from 'xstate/lib/actionTypes';

function fakePayment(){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>resolve('gotcha'),3000)
  })
}

const stateMachine = Machine({
  initial: 'idle',
  context:{
    msg:''
  },
  states:{
    idle:{
      on:{
        //Check if the condition is true, if it is go to loading, else go to next key on this array (error)
        SUBMIT: [{
          target:'loading',
          cond: (ctx,event)=>event.data.name !=='' && event.data.card!==''
        },{
          target:'error'
        }]
      }
    },
    loading:{
      invoke:{
        id:'doPayment',
        src:(ctx,event) => fakePayment(),
        onDone:{
          target: 'success',
          actions: assign({msg:(ctx,event)=>event.data}),
        },
        onError:{
          target: 'error',
          actions: assign({msg:(ctx,event)=>event.data}),
        }
      }
    },
    error:{
      on:{
        SUBMIT:{
          target:'loading',
          cond: (ctx,event)=>event.data.name !=='' && event.data.card!==''
        }
      }
    },
    success:{
      type:'final'
    }
  }
});


function App() {
  const [machine,send] = useMachine(stateMachine);
   console.log([machine,send]);
  const [form,updateForm] = useState({
    name:'',
    card:''
  })
  console.log(form);
  // console.log(machine.value);
  //const service = interpret(machine).start()
  console.log(service);
  
  // machine.onTransition(state=>console.log(state.value)
  // );

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>State Machine Payment Form</h2>
      </div>

    {machine.matches('error')?(
      <div className="alert error">
        {machine.context.msg ? machine.context.msg : 'No errors here lmao'}
      </div>
    ):null}
      <div className="form-body">
        <form
          onSubmit={
            e=>{e.preventDefault();
              send({type:'SUBMIT',data:{...form}})
            }
          }
        >
          <div className="form-group">
            <label htmlFor="NameOnCard">Name on card</label>
            <input
              id="NameOnCard"
              className="form-control"
              type="text"
              maxLength="255"
              value={form.name}
              onChange={e=>updateForm({...form,name:e.target.value})}
            />
          </div>
          <div className="form-group">
            <label htmlFor="CreditCardNumber">Card number</label>
            <input
              id="CreditCardNumber"
              className="null card-image form-control"
              type="text"
              value={form.card}
              onChange={e=>updateForm({...form,card:e.target.value})}
            />
          </div>
          <button
            id="PayButton"
            className="btn btn-block btn-success submit-button"
            type="submit"
          >
            <span className="submit-button-lock" />
            <span className="align-middle">Pay Now</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
