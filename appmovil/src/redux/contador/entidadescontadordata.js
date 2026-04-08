import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { constantes } from "../../uri/constantes"
import api from "../axios_auth"

const baseurl = `${constantes().url_principal[0].url}`
let stateType = ''

export const entidadescontadordata = createAsyncThunk ('', async (params) => {
    stateType = params.stateType
    switch (stateType){
        case 'get_entidades':
        case 'get_detalles_entidad':
        case 'get_movimientos_entidad':
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

const dataEntidadcontador = createSlice ({
    name: 'fetch',
    initialState: initialState (stateType),
    extraReducers: (builder) => {
        builder.addCase (entidadescontadordata.pending, (state) => {
            state.loading = true
        }),
        builder.addCase (entidadescontadordata.fulfilled, (state, action) => {
            state.loading = false
            state.finishWithErrors = false
            state[stateType] = action.payload
        }),
        builder.addCase (entidadescontadordata.rejected, (state) => {
            state.loading = false
            state.finishWithErrors = true
        })
    }
})

export default dataEntidadcontador.reducer