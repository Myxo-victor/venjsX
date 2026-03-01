(function () {
    /*
 * Space mobile app login screen
 * version v1.0 - for mobile app web -- v5.0
*/

const App = () => venjs.div({
  style:{
    width:'100%',
    height:'auto',
    padding:'10px',
    backgroundColor:'white'
  }
},[
  venjs.button({
    style:{
      width:'150px',
      height:'40px',
      paddingTop:'8',
      backgroundColor:'#f59e0b',
      border:'none',
      color:'white',
      borderRadius:'6px',
      display:'flex',
      justifyContent:'center',
      marginLeft:'190px',
      fontFamily:'Arial',
      outline:'none',
      cursor:'pointer',
      textAlign:'center',
      marginTop:'20px'
    }
  },'Go premium'),

 venjs.image({
    style:{
      width:'150px',
      height:'150px',
      display:'block',
      padding:'5px',
      margin:'30px auto',
    },
    src:'./images/logo.png'
  }),

venjs.text({
   style:{
    textAlign:'center',
    fontSize:'24px',
    fontWeight:'600',
    color:'black',
    fontFamily:'myfont'
    }
},'Sign in'),

venjs.input({
  style:{
    width:'320px',
    height:'40px',
    padding:'10px',
    border:'1px solid rgb(238, 230, 230)',
    display:'block',
    margin:'10px 10px 10px 10px',
    backgroundColor:'white',
    marginLeft:'15px',
    marginBottom:'10px',
    borderRadius:'6px',
    marginTop:'10px',
    fontSize:'14px'
  },
  type:'email',
  id:'email',
  placeholder:'Email address'
}),

venjs.input({
  style:{
    width:'320px',
    height:'40px',
    padding:'10px',
    border:'1px solid rgb(238, 230, 230)',
    display:'block',
    margin:'10px 10px 10px 10px',
    backgroundColor:'white',
    marginLeft:'15px',
    marginBottom:'10px',
    borderRadius:'6px',
    marginTop:'10px',
    fontSize:'14px'
  },
  type:'password',
  id:'password',
  placeholder:'Password'
}),

venjs.div({
   style:{
     width:'200px',
     height:'auto',
     paddingLeft:'10px'
   }
},[
  venjs.input({
    type:'checkbox',
    style:{
      padding:'5px'
    }
  }),

  venjs.text({style:{
    fontSize:'14px',
    color:'black',
    marginLeft:'2px'
  }},'Show Password')
]),

venjs.button({
  style:{
    width:'300px',
    height:'40px',
    borderRadius:'6px',
    backgroundColor:'red',
    color:'white',
    textAlign:'center',
    border:'none',
    outline:'none',
    padding:'10px',
   margin:'10px auto'
  }
},'Sign in'),

venjs.text({
  style:{
    textAlign:'center'
  }
},' ___________________or____________________'),

venjs.button({
   style:{
    width:'300px',
    height:'40px',
    borderRadius:'6px',
    backgroundColor:'black',
    color:'white',
    textAlign:'center',
    border:'none',
    outline:'none',
     padding:'10px',
     margin:'10px auto'
  },
  onClick:() => prompt('Hello world')
},'Create a new account'),

 venjs.image({
            src: './images/from Aximon (Black).png',
            style:{
              width: '50px',
              height:'auto',
              display: 'block',
              margin: '10px auto',
              padding:'5px'
            }
        }),

  venjs.text({
    style:{
      textAlign:'center',
      marginTop:'10px',
      fontSize:'14px'
    }
  },'© 2026 Aximon Platforms. All rights reserved')




])

  venjs.mount(App);
})();
