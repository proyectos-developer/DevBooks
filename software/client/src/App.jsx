import React from 'react'
import { BrowserRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx' 
import './styles.css'

// COMPONENTES DE AUTENTICACIÓN
import { LoginPanel, ForgotPasswordPanel, ResetPasswordPanel, CambiarClaveObligatorio } from './auth.js'

// PANELES ADMINISTRATIVOS (Gerencia/Empresa)
import {
    GlobalPanelAdmin, HomeAdmin,
    GestionEmpresas, RegistroEmpresa, EditarEmpresa,
    PanelReportesFinancieros, DetalleReporteEmpresa,
    GestionUsuariosAdmin, EditarUsuarioAdmin, NuevoUsuarioAdmin,
    AjustesSistema
} from './admin.js'

// PANELES CONTADOR (Operaciones SUNAT)
import {
    GlobalPanelContador, HomeContador,
    LibroDiarioLista, FormularioAsiento, AsientoDetalle,
    PlanContableLista ,
    BalanceComprobacion,
    EntidadesLista, EntidadFormEdicion, EntidadHistorial,
    PeriodosLista, PeriodoFormNuevo,
    ReportesPanel, GeneradorPLE, LibroMayorLista,
    RegistroVentasSIRE, RegistroComprasSIRE,
    GenerarEstadosFinancieros,
    ConciliacionBancaria,
    AjustesContador
} from './contador.js'

// PORTAL CLIENTE (Consulta de Facturas/Reportes)
import {
    GlobalPanelCliente, HomeCliente,
    MisComprobantes,
    DescargarReportes,
    PerfilCliente
} from './cliente.js'

function RoleBasedRedirect() {
    const { user, loading } = useAuth();
    if (loading) return null; 
    if (!user) return <Navigate to="/login" replace />;
    if (user.primerIngreso) return <Navigate to="/cambiar-clave-obligatorio" replace />;

    const rutasPorRol = {
        ADMINISTRADOR: '/admin',
        CONTADOR: '/contador',
        CLIENTE: '/cliente'
    };

    return <Navigate to={rutasPorRol[user.rol] || '/login'} replace />;
}

function PrivateRoute({ children, requiredRole }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="loading_screen">Cargando Sistema Contable...</div>;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

    if (user.primerIngreso && location.pathname !== '/cambiar-clave-obligatorio') {
        return <Navigate to="/cambiar-clave-obligatorio" replace />;
    }

    if (requiredRole && user.rol !== requiredRole && user.rol !== 'ADMINISTRADOR') {
        return <div className="denied">No tiene permisos para este módulo contable</div>;
    }
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<RoleBasedRedirect />} />

                    {/* DASHBOARD ADMIN (Dueño de la Agencia) */}
                    <Route path='/admin' element={<PrivateRoute requiredRole="ADMINISTRADOR"><GlobalPanelAdmin /></PrivateRoute>}>
                        <Route index element={<HomeAdmin />}/>
                        <Route path="empresas" element={<GestionEmpresas />} />
                        <Route path="empresas/nueva" element={<RegistroEmpresa />} />
                        <Route path="empresas/editar/:id" element={<EditarEmpresa />} />
                        <Route path="reportes-globales" element={<PanelReportesFinancieros />} />
                        <Route path="reportes/detalle/:id" element={<DetalleReporteEmpresa />} />
                        <Route path="usuarios" element={<GestionUsuariosAdmin />} />
                        <Route path="usuarios/editar/:id" element={<EditarUsuarioAdmin />} />
                        <Route path="usuarios/nuevo" element={<NuevoUsuarioAdmin />} />
                        <Route path='ajustes' element={<AjustesSistema />}/>
                    </Route>

                    {/* DASHBOARD CONTADOR (Operatividad) */}
                    <Route path='/contador' element={<PrivateRoute requiredRole="CONTADOR"><GlobalPanelContador /></PrivateRoute>}>
                        <Route index element={<HomeContador />}/>
                        <Route path="asientos" element={<LibroDiarioLista />} />
                        <Route path="asientos/nuevo" element={<FormularioAsiento />} />
                        <Route path="asientos/detalle/:id" element={<AsientoDetalle />} />
                        <Route path="plan-cuentas" element={<PlanContableLista />} />
                        <Route path="reportes/balance" element={<BalanceComprobacion />} />
                        <Route path="entidades" element={<EntidadesLista />} />
                        <Route path="entidades/editar/:id" element={<EntidadFormEdicion />} />
                        <Route path="entidades/historial/:id" element={<EntidadHistorial />} />
                        <Route path="periodos" element={<PeriodosLista />} />
                        <Route path="periodos/nuevo" element={<PeriodoFormNuevo />} />
                        <Route path="reportes" element={<ReportesPanel />} />
                        <Route path="reportes/ple-diario" element={<GeneradorPLE />} />
                        <Route path="reportes/libro-mayor" element={<LibroMayorLista />} />
                        <Route path="sire-ventas" element={<RegistroVentasSIRE />} />
                        <Route path="sire-compras" element={<RegistroComprasSIRE />} />
                        <Route path="estados-financieros" element={<GenerarEstadosFinancieros />} />
                        <Route path="bancos" element={<ConciliacionBancaria />} />
                        <Route path="ajustes" element={<AjustesContador />} />
                    </Route>

                    {/* PORTAL CLIENTE (Auto-servicio) */}
                    <Route path='/cliente' element={<PrivateRoute requiredRole="CLIENTE"><GlobalPanelCliente /></PrivateRoute>}>
                        <Route index element={<HomeCliente />} />
                        <Route path="mis-facturas" element={<MisComprobantes />}/>
                        <Route path="mis-reportes" element={<DescargarReportes />}/>
                        <Route path='perfil' element={<PerfilCliente />} />
                    </Route>

                    <Route path='/login' element={<LoginPanel/>}/>
                    <Route path='/forgot-password' element={<ForgotPasswordPanel />}/>
                    <Route path='/reset-password/:token' element={<ResetPasswordPanel />}/>
                    <Route path='/cambiar-clave-obligatorio' element={<PrivateRoute><CambiarClaveObligatorio /></PrivateRoute>}/>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    )
}