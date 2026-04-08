import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { constantes } from "../../uri/constantes"
import api from "../axios_auth"

const baseurl = `${constantes().url_principal[0].url}`
let stateType = ''

export const bancoscontadordata = createAsyncThunk ('', async (params) => {
    stateType = params.stateType
    switch (stateType){
        case 'get_conciliacion':
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

const dataBancoscontador = createSlice ({
    name: 'fetch',
    initialState: initialState (stateType),
    extraReducers: (builder) => {
        builder.addCase (bancoscontadordata.pending, (state) => {
            state.loading = true
        }),
        builder.addCase (bancoscontadordata.fulfilled, (state, action) => {
            state.loading = false
            state.finishWithErrors = false
            state[stateType] = action.payload
        }),
        builder.addCase (bancoscontadordata.rejected, (state) => {
            state.loading = false
            state.finishWithErrors = true
        })
    }
})

export default dataBancoscontador.reducer