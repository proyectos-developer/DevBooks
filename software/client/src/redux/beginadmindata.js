import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import axios from 'axios'
import { constantes } from "../uri/constantes"
import api from "./axios_auth"

const baseurl = `${constantes().url_principal[0].url}`
let stateType = ''

export const beginadmindata = createAsyncThunk ('', async (params) => {
    stateType = params.stateType
    switch (stateType){
        case 'registrar_usuario':
            if (params.reset){ 
                return {success: false}
            }else{
                try{
                    const response = await api.post (`${constantes().url_principal[0].url}/${params.path}`, params.data)
                    return response.data
                }catch (err){
                    return err.message
                }
            }
        default: return null
    }
})

const initialState = (type) => {
    return {
        [type]: [],
        loading: false,
        finishWithErrors: false,
        errorMessage: 'Hemos tenido problemas solicitando la información'
    }
}

const dataBeginadmin = createSlice ({
    name: 'fetch',
    initialState: initialState (stateType),
    extraReducers: (builder) => {
        builder.addCase (beginadmindata.pending, (state) => {
            state.loading = true
        }),
        builder.addCase (beginadmindata.fulfilled, (state, action) => {
            state.loading = false
            state.finishWithErrors = false
            state[stateType] = action.payload
        }),
        builder.addCase (beginadmindata.rejected, (state) => {
            state.loading = false
            state.finishWithErrors = true
        })
    }
})

export default dataBeginadmin.reducer