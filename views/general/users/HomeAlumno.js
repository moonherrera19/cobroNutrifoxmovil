import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { FIREBASE_AUTH } from "../../services/firebaseConfig";
import { fetchCurrentUserData } from "../../services/userService";

const HomeAlumno = () => {
  const [alumno, setAlumno] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      const data = await fetchCurrentUserData();
      setAlumno(data);
    };
    cargarDatos();
  }, []);

  if (!alumno) return <Text>Cargando...</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {alumno.nombre}</Text>
      <Text>Carrera: {alumno.carrera}</Text>
      <Text>Estado de beca: {alumno.estado_beca}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 }
});

export default HomeAlumno;
