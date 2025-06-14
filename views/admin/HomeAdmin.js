import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  TextInput,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FIRESTORE_DB, FIREBASE_AUTH } from "../../services/firebaseConfig";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const HomeAdmin = () => {
  const [becas, setBecas] = useState([]);
  const [resumenSemanal, setResumenSemanal] = useState({});
  const [busqueda, setBusqueda] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    cargarBecas();
    cargarGrafica();
  }, []);

  const cargarBecas = async () => {
    const snapshot = await getDocs(collection(FIRESTORE_DB, "user"));
    const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setBecas(datos);
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const ref = doc(FIRESTORE_DB, "user", id);
      await updateDoc(ref, { estado_beca: nuevoEstado });
      cargarBecas();
    } catch (error) {
      Alert.alert("Error", "No se pudo cambiar el estado.");
    }
  };

  const cargarGrafica = async () => {
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 6);
    hace7dias.setHours(0, 0, 0, 0);
    const q = query(
      collection(FIRESTORE_DB, "becas"),
      where("fecha", ">=", Timestamp.fromDate(hace7dias))
    );
    const snapshot = await getDocs(q);
    const datos = snapshot.docs.map((doc) => doc.data());
    const resumen = { lun: 0, mar: 0, mie: 0, jue: 0, vie: 0, sab: 0, dom: 0 };
    datos.forEach((item) => {
      const fecha = item.fecha.toDate();
      const dia = fecha.toLocaleDateString("es-MX", { weekday: "short" }).toLowerCase();
      if (resumen[dia] !== undefined) resumen[dia]++;
    });
    setResumenSemanal(resumen);
  };

  const descargarPDF = async () => {
    try {
      const url = "http://192.168.100.48:8000/becas/reporte/pdf";
      const fileUri = FileSystem.documentDirectory + "reporte_admin.pdf";
      const download = await FileSystem.downloadAsync(url, fileUri);
      await Sharing.shareAsync(download.uri);
    } catch (err) {
      Alert.alert("Error", "No se pudo descargar el reporte.");
      console.error("❌ Error real:", err.message);
    }
  };

  const cerrarSesion = async () => {
    await FIREBASE_AUTH.signOut();
    navigation.replace("LogIn");
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={cerrarSesion} style={styles.btnCerrarSesion}>
            <Text style={styles.btnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.titulo}>📊 Panel del Administrador 🧑‍💻</Text>

        <Text style={styles.subtitulo}>📈 Cobros por semana</Text>
        <LineChart
          data={{
            labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
            datasets: [
              {
                data: [
                  resumenSemanal["lun"] || 0,
                  resumenSemanal["mar"] || 0,
                  resumenSemanal["mie"] || 0,
                  resumenSemanal["jue"] || 0,
                  resumenSemanal["vie"] || 0,
                  resumenSemanal["sab"] || 0,
                  resumenSemanal["dom"] || 0,
                ],
              },
            ],
          }}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundGradientFrom: "#272121",
            backgroundGradientTo: "#FF4D00",
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          }}
          bezier
          style={{ borderRadius: 10, marginVertical: 10 }}
        />

       

        <Text style={styles.subtitulo}>👨‍🎓 Lista de alumnos</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar por número de control"
          placeholderTextColor="#888"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {becas
          .filter((a) => a.numero_control.includes(busqueda))
          .map((item, idx) => (
            <View key={idx} style={styles.cardAlumno}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.whiteText}>No. Control: {item.numero_control}</Text>
              <Text style={styles.whiteText}>Carrera: {item.carrera}</Text>
              <Text style={styles.whiteText}>Estado: {item.estado_beca}</Text>
              {item.rol === "alumno" && (
                <TouchableOpacity
                  style={
                    item.estado_beca === "becario"
                      ? styles.btnRojo
                      : styles.btnVerde
                  }
                  onPress={() =>
                    cambiarEstado(
                      item.id,
                      item.estado_beca === "becario" ? "sin beca" : "becario"
                    )
                  }
                >
                  <Text style={styles.btnText}>
                    {item.estado_beca === "becario"
                      ? "❌ Quitar beca"
                      : "✅ Dar beca"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 50,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginVertical: 10,
  },
  cardAlumno: {
    backgroundColor: "#fff",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  nombre: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  btnVerde: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  btnRojo: {
    backgroundColor: "#8B0000",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  btnCerrarSesion: {
    backgroundColor: "#FF4D00",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  botonDescarga: {
    backgroundColor: "#272121",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  whiteText: {
    color: "#000",
  },
});

export default HomeAdmin;
