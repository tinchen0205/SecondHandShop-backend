<script>
    import axios from 'axios';
    export default{
        name:'login',
        data(){
            return{
                email:'',
                password:'',
                error:''
            };
        },
        methods:{
            async login(){
                try{
                    await axios.post('http://localhost:3000/login/',{
                        email:this.email,
                        password:this.password
                    });
                alert('User login successfully');
                }catch(error){
                    //console.error('Login Error:', error);;
                    //alert('Login Error: ' + error.message);
                    this.error = error.response.data.message;
                    alert('Login Error: '+ this.error);
                }
            }
        }
    }
    
</script>

<template>
    <body class="text-center">
    
    <main class="form-signin">
      <form class="login col-6 mx-auto mt-5" > 
        
        <h1 class="h3 mb-3 fw-normal">登入</h1>
        <div class="d-flex justify-content-center">
            <div class="form-floating mb-3 col-6">
            <input type="email" class="form-control" id="floatingInput" placeholder="name@example.com" v-model="email">
            <label for="floatingInput">Email address</label>
            </div>
        </div>
        <div class="d-flex justify-content-center">
            <div class="form-floating mb-3 col-6">
            <input type="password" class="form-control" id="floatingPassword" placeholder="Password" v-model="password">
            <label for="floatingPassword">Password</label>
            </div>
        </div>
        <div class="d-flex justify-content-center mb-3">
            <button class="btn btn-sm btn-outline-success col-3 circle" type="submit" @click="login">登入</button> <!--新增@click="login"-->
            <div class="mx-1"></div>
            <RouterLink to="/Register" class="btn btn-sm btn-outline-warning col-3 circle">註冊</RouterLink>
        </div>
        <div>
            <button class="btn btn-sm btn btn-outline-secondary col-3 circle">
            <RouterLink to="/" class="nav-link px-3">首頁</RouterLink>
            </button>
        </div>

        
      </form>
    </main>
    
    </body>
</template>

<style >

.login{
    background-color:#FAEBD7;
    padding: 40px;
    box-shadow: 5px 5px 10px 	#D8D8EB;
}
.form-control{
    outline: none !important;
    box-shadow: none !important;
    border-color: #D8D8EB;
}
.circle{
    border-radius: 25px;
}

</style>