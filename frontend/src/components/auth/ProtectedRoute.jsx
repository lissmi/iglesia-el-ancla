//frontend/src/components/auth/ProtectedRoute.jsx

// Importamos las herramientas necesarias
// para controlar la navegación protegida.
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";


// Importamos las herramientas necesarias
// para consultar la sesión al cargar
// el componente.
import {
  useEffect,
  useState,
} from "react";


// Importamos el icono
// utilizado durante la carga.
import {
  LoaderCircle,
} from "lucide-react";


// Importamos nuestra instancia
// centralizada de Axios.
import api from "../../services/api";


// Importamos los estilos
// exclusivos del componente.
import "../../styles/components/auth/ProtectedRoute.css";


// =========================================================
// COMPONENTE
// =========================================================

// ProtectedRoute permitirá proteger
// grupos completos de rutas.
//
// allowedRoles:
//
// contiene los roles autorizados
// para acceder a la ruta.
//
// Ejemplo:
//
// allowedRoles={["super_admin"]}
//
// o:
//
// allowedRoles={["admin", "super_admin"]}
function ProtectedRoute({
  allowedRoles = [],
}) {

  // Obtenemos la ruta
  // que el usuario intenta visitar.
  const location =
    useLocation();


  // =========================================================
  // ESTADO
  // =========================================================

  // Guardamos el usuario
  // autenticado obtenido desde el backend.
  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);


  // Indicamos si todavía estamos
  // comprobando la sesión.
  const [
    isLoading,
    setIsLoading,
  ] = useState(true);


  // Guardamos si la sesión
  // es válida o no.
  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);


  // =========================================================
  // COMPROBAR SESIÓN
  // =========================================================

  useEffect(() => {

    // Creamos la función encargada
    // de comprobar la sesión actual.
    const verifySession = async () => {

      try {

        // Consultamos nuestro endpoint protegido.
        //
        // api.js ya incluye:
        //
        // withCredentials: true
        //
        // por lo que la cookie HttpOnly
        // será enviada automáticamente.
        const response =
          await api.get(
            "/auth/me"
          );


        // Comprobamos que exista
        // un usuario válido.
        if (
          response.data?.success &&
          response.data?.user
        ) {

          // Guardamos el usuario.
          setCurrentUser(
            response.data.user
          );


          // Confirmamos que existe
          // una sesión válida.
          setIsAuthenticated(
            true
          );
        }

      } catch (error) {

        // Si el backend rechaza la sesión,
        // consideramos al usuario
        // como no autenticado.
        setCurrentUser(
          null
        );

        setIsAuthenticated(
          false
        );

      } finally {

        // Indicamos que terminó
        // la comprobación.
        setIsLoading(
          false
        );
      }
    };


    // Ejecutamos la comprobación
    // al cargar la ruta privada.
    verifySession();

  }, []);


  // =========================================================
  // CARGANDO
  // =========================================================

  // Mientras comprobamos la sesión
  // no mostramos todavía la página privada.
  if (isLoading) {

    return (
      <main className="protected-route">

        <div className="protected-route__loader">

          <LoaderCircle
            className="protected-route__spinner"
            size={32}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <span>
            Verificando sesión...
          </span>

        </div>

      </main>
    );
  }


  // =========================================================
  // SIN SESIÓN
  // =========================================================

  // Si no existe una sesión válida,
  // enviamos al usuario al login.
  if (
    !isAuthenticated ||
    !currentUser
  ) {

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  // =========================================================
  // VALIDACIÓN DEL ROL
  // =========================================================

  // Si esta ruta tiene roles definidos
  // comprobamos que el rol actual
  // se encuentre permitido.
  const roleIsAllowed =
    allowedRoles.length === 0 ||
    allowedRoles.includes(
      currentUser.role
    );


  // Si el usuario tiene sesión,
  // pero intenta acceder a una sección
  // perteneciente a otro rol,
  // lo enviamos a su propio panel.
  if (!roleIsAllowed) {

    // Creamos un mapa cerrado
    // con la página correspondiente
    // a cada rol.
    const destinationsByRole = {

      member:
        "/member",

      admin:
        "/admin",

      super_admin:
        "/super-admin",
    };


    // Obtenemos el destino
    // correspondiente al usuario.
    const destination =
      destinationsByRole[
        currentUser.role
      ] || "/";


    return (
      <Navigate
        to={destination}
        replace
      />
    );
  }


  // =========================================================
  // ACCESO AUTORIZADO
  // =========================================================

  // Si existe sesión válida
  // y el rol está permitido,
  // mostramos las rutas hijas.
  return (
    <Outlet />
  );
}


// Exportamos el componente
// para utilizarlo dentro de App.js.
export default ProtectedRoute;