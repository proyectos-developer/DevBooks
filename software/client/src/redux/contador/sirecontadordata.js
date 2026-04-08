import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { constantes } from "../../uri/constantes"
import api from "../axios_auth"

const baseurl = `${constantes().url_principal[0].url}`
let stateType = ''

export const sirecontadordata = createAsyncThunk ('', async (params) => {
    stateType = params.stateType
    switch (stateType){
        case 'get_sire_ventas_comparar':
        case 'get_sire_compras_comparar':
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

const dataSirecontador = createSlice ({
    name: 'fetch',
    initialState: initialState (stateType),
    extraReducers: (builder) => {
        builder.addCase (sirecontadordata.pending, (state) => {
            state.loading = true
        }),
        builder.addCase (sirecontadordata.fulfilled, (state, action) => {
            state.loading = false
            state.finishWithErrors = false
            state[stateType] = action.payload
        }),
        builder.addCase (sirecontadordata.rejected, (state) => {
            state.loading = false
            state.finishWithErrors = true
        })
    }
})

export default dataSirecontador.reducer