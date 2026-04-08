import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { constantes } from "../../uri/constantes"
import api from "../axios_auth"

const baseurl = `${constantes().url_principal[0].url}`
let stateType = ''

export const empresasadmindata = createAsyncThunk ('', async (params) => {
    stateType = params.stateType
    switch (stateType){
        case 'get_empresas':
        case 'get_empresa':
            if (params.reset){ 
                return {success: false}
            }else{
                try{
                    const response = await api.get (`${constantes().url_principal[0].url}/${params.path}`)
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

const dataEmpresasadmin = createSlice ({
    name: 'fetch',
    initialState: initialState (stateType),
    extraReducers: (builder) => {
        builder.addCase (empresasadmindata.pending, (state) => {
            state.loading = true
        }),
        builder.addCase (empresasadmindata.fulfilled, (state, action) => {
            state.loading = false
            state.finishWithErrors = false
            state[stateType] = action.payload
        }),
        builder.addCase (empresasadmindata.rejected, (state) => {
            state.loading = false
            state.finishWithErrors = true
        })
    }
})

export default dataEmpresasadmin.reducer