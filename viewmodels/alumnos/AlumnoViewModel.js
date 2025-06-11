import { useState } from "react";
import { fetchCurrentUserData } from "../../services/userService";
import { getAuth, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../../services/firebaseConfig";

export const useAlumnoViewModel = () => {
  const [alumno, setAlumno] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const obtenerDatos = async () => {
    try {
      setLoading(true);
      const datos = await fetchCurrentUserData();
      setAlumno(datos);

      if (datos.numero_control) {
        const becasRef = collection(FIRESTORE_DB, "becas");
        const q = query(becasRef, where("numero_control", "==", datos.numero_control));
        const snapshot = await getDocs(q);
        const historialBecas = snapshot.docs.map(doc => doc.data());

        // Ordenar por fecha descendente si quieres
        historialBecas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        setHistorial(historialBecas);
      }
    } catch (err) {
      setError("Error al cargar datos del alumno o historial");
    } finally {
      setLoading(false);
    }
  };

  const cerrarSesion = async () => {
    try {
      await signOut(getAuth());
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  return {
    alumno,
    historial,
    loading,
    error,
    obtenerDatos,
    cerrarSesion,
  };
};
