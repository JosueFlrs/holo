'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { clienteSupabase } from "@/utilities/clienteSupabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Save, Package, Trash2, Pencil, Lock, LogOut } from "lucide-react";

export default function PanelAdministrador() {
    // --- ESTADOS DE AUTENTICACIÓN ---
    const [sesionUsuario, setSesionUsuario] = useState(null);
    const [correoElectronico, setCorreoElectronico] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [verificandoSesion, setVerificandoSesion] = useState(true);
    const [cargandoLogin, setCargandoLogin] = useState(false);

    // --- ESTADOS DEL CRUD ---
    const [listaProductos, setListaProductos] = useState([]);
    const [listaCategorias, setListaCategorias] = useState([]);
    const [estaCargando, setEstaCargando] = useState(true);
    const [nombreProducto, setNombreProducto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [idCategoriaSeleccionada, setIdCategoriaSeleccionada] = useState("");
    const [nombreVariante, setNombreVariante] = useState("");
    const [precioUnitario, setPrecioUnitario] = useState("");
    const [urlImagen, setUrlImagen] = useState("");
    const [estaGuardando, setEstaGuardando] = useState(false);

    // --- EFECTO DE AUTENTICACIÓN ---
    useEffect(() => {
        // 1. Verificamos si ya hay una sesión guardada al entrar
        clienteSupabase.auth.getSession().then(({ data: { session } }) => {
            setSesionUsuario(session);
            setVerificandoSesion(false);
            if (session) cargarDatosIniciales();
        });

        // 2. Nos suscribimos a los cambios de estado (si se loguea o desloguea)
        const { data: { subscription } } = clienteSupabase.auth.onAuthStateChange((_evento, session) => {
            setSesionUsuario(session);
            if (session) cargarDatosIniciales();
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- FUNCIONES DE AUTENTICACIÓN ---
    const manejarInicioSesion = async (evento) => {
        evento.preventDefault();
        setCargandoLogin(true);

        // Supabase espera los parámetros 'email' y 'password' en inglés internamente
        const { error } = await clienteSupabase.auth.signInWithPassword({
            email: correoElectronico,
            password: contrasenia,
        });

        if (error) {
            alert("Credenciales incorrectas. Verificá tu correo y contraseña.");
        }
        setCargandoLogin(false);
    };

    const manejarCierreSesion = async () => {
        await clienteSupabase.auth.signOut();
        setListaProductos([]); // Limpiamos la memoria por seguridad
    };

    // --- FUNCIONES DEL CRUD ---
    const refrescarCatalogo = async () => {
        const { data } = await clienteSupabase
            .from("productos")
            .select(`
        id, nombreProducto, categorias ( nombreCategoria ),
        variantesProducto ( id, nombreVariante, precioUnitario )
      `)
            .order('id', { ascending: false });
        if (data) setListaProductos(data);
    };

    async function cargarDatosIniciales() {
        setEstaCargando(true);
        const { data: categoriasData } = await clienteSupabase.from("categorias").select("id, nombreCategoria");
        if (categoriasData) setListaCategorias(categoriasData);
        await refrescarCatalogo();
        setEstaCargando(false);
    }

    const manejarAltaProducto = async (evento) => {
        evento.preventDefault();
        if (!nombreProducto || !idCategoriaSeleccionada || !nombreVariante || !precioUnitario) return;
        setEstaGuardando(true);

        try {
            const { data: nuevoProducto, error: errorProducto } = await clienteSupabase
                .from("productos")
                .insert([{ nombreProducto, descripcion, idCategoria: parseInt(idCategoriaSeleccionada) }])
                .select()
                .single();

            if (errorProducto) throw errorProducto;

            if (nuevoProducto) {
                const { error: errorVariante } = await clienteSupabase
                    .from("variantesProducto")
                    .insert([{
                        idProducto: nuevoProducto.id, nombreVariante, precioUnitario: parseFloat(precioUnitario),
                        urlImagen: urlImagen || "https://images.unsplash.com/photo-1572375995301-4598b2c20ce4?w=500"
                    }]);
                if (errorVariante) throw errorVariante;

                setNombreProducto(""); setDescripcion(""); setIdCategoriaSeleccionada("");
                setNombreVariante(""); setPrecioUnitario(""); setUrlImagen("");
                await refrescarCatalogo();
            }
        } catch (error) {
            alert("Hubo un error al guardar.");
        } finally {
            setEstaGuardando(false);
        }
    };

    const manejarEliminarProducto = async (idProducto) => {
        const confirmacion = window.confirm("¿Eliminar este producto y sus opciones?");
        if (!confirmacion) return;
        setEstaCargando(true);
        await clienteSupabase.from("productos").delete().eq("id", idProducto);
        await refrescarCatalogo();
        setEstaCargando(false);
    };

    const manejarEditarPrecio = async (idVariante, precioActual) => {
        const nuevoPrecio = window.prompt("Ingresá el nuevo precio unitario:", precioActual);
        if (!nuevoPrecio || isNaN(nuevoPrecio) || Number(nuevoPrecio) === precioActual) return;
        setEstaCargando(true);
        await clienteSupabase.from("variantesProducto").update({ precioUnitario: parseFloat(nuevoPrecio) }).eq("id", idVariante);
        await refrescarCatalogo();
        setEstaCargando(false);
    };

    // --- RENDERIZADO CONDICIONAL ---

    // 1. Pantalla de carga mientras lee las cookies/localStorage
    if (verificandoSesion) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center font-base">
                <span className="font-bold text-slate-500 animate-pulse">Verificando credenciales...</span>
            </div>
        );
    }

    // 2. Pantalla de Login si no hay usuario autenticado
    if (!sesionUsuario) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6 font-base">
                <Card className="w-full max-w-sm bg-white border-4 border-slate-900 rounded-3xl shadow-[8px_8px_0px_rgba(15,23,42,1)] overflow-hidden">
                    <CardHeader className="bg-primary text-white border-b-4 border-slate-900 p-6 text-center">
                        <div className="mx-auto bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mb-4 border-2 border-white">
                            <Lock className="h-6 w-6 text-accent" />
                        </div>
                        <CardTitle className="font-retro text-3xl tracking-wider">HOLO ADMIN</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={manejarInicioSesion} className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Correo Electrónico</label>
                                <input
                                    type="email" required value={correoElectronico} onChange={(e) => setCorreoElectronico(e.target.value)}
                                    className="border-2 border-slate-900 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:bg-white"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-slate-700 uppercase">Contraseña</label>
                                <input
                                    type="password" required value={contrasenia} onChange={(e) => setContrasenia(e.target.value)}
                                    className="border-2 border-slate-900 rounded-xl px-4 py-3 text-sm bg-slate-50 focus:outline-none focus:bg-white"
                                />
                            </div>
                            <Button type="submit" disabled={cargandoLogin} className="w-full bg-accent hover:bg-accent/90 text-slate-900 font-black uppercase tracking-wider h-12 rounded-xl border-2 border-slate-900 shadow-sm mt-4 cursor-pointer">
                                {cargandoLogin ? "Ingresando..." : "Acceder al Panel"}
                            </Button>
                        </form>
                        <div className="mt-6 text-center">
                            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-primary transition-colors underline">
                                Volver a la tienda
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 3. Pantalla del Administrador (Solo si está logueado)
    return (
        <div className="min-h-screen bg-background pb-12 font-base">
            <header className="bg-primary border-b-4 border-slate-900 px-6 py-4 shadow-sm text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/">
                        <Button size="icon" variant="outline" className="rounded-full bg-white text-slate-900 border-2 border-slate-900 h-10 w-10 hover:bg-slate-100 cursor-pointer">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <h1 className="font-retro text-2xl tracking-wide drop-shadow-[1px_1px_0px_rgba(15,23,42,1)]">
                        Panel de Control HOLO
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden md:inline-block bg-slate-900 text-accent font-bold text-xs px-3 py-1 rounded-full border border-white">
                        {sesionUsuario.user.email}
                    </span>
                    <Button onClick={manejarCierreSesion} size="sm" className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full border-2 border-slate-900 shadow-sm cursor-pointer gap-2">
                        <LogOut className="h-4 w-4" />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </Button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2">
                    <Card className="bg-white border-2 border-slate-900 rounded-3xl shadow-md overflow-hidden">
                        <CardHeader className="bg-accent/20 border-b-2 border-slate-900 p-4">
                            <CardTitle className="font-retro text-xl text-slate-950 flex items-center gap-2">
                                <Plus className="h-5 w-5" /> Nuevo Producto
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={manejarAltaProducto} className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-black uppercase text-primary tracking-wider mb-3">1. Datos Generales</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">Nombre del Producto *</label>
                                            <input type="text" required value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} className="border-2 border-slate-900 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">Categoría *</label>
                                            <select required value={idCategoriaSeleccionada} onChange={(e) => setIdCategoriaSeleccionada(e.target.value)} className="border-2 border-slate-900 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white cursor-pointer h-10.5">
                                                <option value="">Seleccionar...</option>
                                                {listaCategorias.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.nombreCategoria}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-700">Descripción del Producto</label>
                                            <textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="border-2 border-slate-900 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white resize-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4">
                                    <h3 className="text-xs font-black uppercase text-primary tracking-wider mb-3">2. Primera Opción</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">Nombre de la Variante *</label>
                                            <input type="text" required value={nombreVariante} onChange={(e) => setNombreVariante(e.target.value)} className="border-2 border-slate-900 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-bold text-slate-700">Precio Unitario (ARS) *</label>
                                            <input type="number" required min="0" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} className="border-2 border-slate-900 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white" />
                                        </div>
                                        <div className="flex flex-col gap-1.5 sm:col-span-2">
                                            <label className="text-xs font-bold text-slate-700">URL de la Imagen</label>
                                            <input type="url" value={urlImagen} onChange={(e) => setUrlImagen(e.target.value)} className="border-2 border-slate-900 rounded-xl px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:bg-white" />
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={estaGuardando} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl border-2 border-slate-900 shadow-sm gap-2 cursor-pointer mt-2">
                                    <Save className="h-5 w-5" />
                                    {estaGuardando ? "Procesando..." : "Guardar Producto"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="bg-white border-2 border-slate-900 rounded-3xl shadow-md overflow-hidden max-h-[80vh] flex flex-col">
                        <CardHeader className="bg-slate-900 border-b-2 border-slate-900 p-4 text-white">
                            <CardTitle className="font-retro text-xl flex items-center gap-2">
                                <Package className="h-5 w-5" /> Inventario
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 overflow-y-auto flex-1 space-y-3 relative">

                            {estaCargando && (
                                <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 backdrop-blur-[1px]">
                                    <span className="font-bold text-slate-900">Sincronizando...</span>
                                </div>
                            )}

                            {listaProductos.length === 0 && !estaCargando ? (
                                <div className="text-center text-xs text-slate-400 py-8">No hay ítems registrados.</div>
                            ) : (
                                listaProductos.map((prod) => (
                                    <div key={`inv-${prod.id}`} className="p-3 bg-slate-50 border-2 border-slate-900 rounded-xl flex flex-col gap-1 group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 text-sm leading-tight">{prod.nombreProducto}</span>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                    {prod.categorias?.nombreCategoria}
                                                </span>
                                            </div>
                                            <button onClick={() => manejarEliminarProducto(prod.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1" title="Eliminar producto entero">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="border-t border-slate-200 mt-1.5 pt-1.5 space-y-1 text-slate-600 text-xs">
                                            {prod.variantesProducto?.map((varItem) => (
                                                <div key={`var-${varItem.id}`} className="flex justify-between items-center bg-white p-1.5 rounded border border-slate-200">
                                                    <span className="truncate pr-2">• {varItem.nombreVariante}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-primary">
                                                            ${Number(varItem.precioUnitario).toLocaleString('es-AR')}
                                                        </span>
                                                        <button onClick={() => manejarEditarPrecio(varItem.id, varItem.precioUnitario)} className="text-slate-400 hover:text-blue-600 transition-colors" title="Editar precio">
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    );
}