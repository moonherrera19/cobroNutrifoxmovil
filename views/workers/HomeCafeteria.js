import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  ToastAndroid,
  Platform,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useCafeteriaViewModel } from "../../viewmodels/workers/CafeteriaViewModel";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/firebaseConfig";
import { registrarCobroBeca } from "../../services/userService";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { LineChart } from "react-native-chart-kit";
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import * as FileSystem from 'expo-file-system';

const LIMITE_BECAS_DIARIO = 70;
const screenWidth = Dimensions.get("window").width;

const HomeCafeteria = () => {
  const scrollRef = useRef(null);
  const navigation = useNavigation();
  const { numeroControl, setNumeroControl, alumno, buscarAlumno, resetear } =
    useCafeteriaViewModel();
  const [contador, setContador] = useState(0);
  const [historial, setHistorial] = useState([]);
  const [resumenSemanal, setResumenSemanal] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      const cargarDatos = async () => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const timestampInicio = Timestamp.fromDate(hoy);

        const q = query(
          collection(FIRESTORE_DB, "becas"),
          where("fecha", ">=", timestampInicio)
        );
        const snapshot = await getDocs(q);
        setContador(snapshot.size);
      };

      const cargarHistorial = async () => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const timestampInicio = Timestamp.fromDate(hoy);

        const q = query(
          collection(FIRESTORE_DB, "becas"),
          where("fecha", ">=", timestampInicio),
          orderBy("fecha", "desc"),
          limit(10)
        );
        const snapshot = await getDocs(q);
        const datos = snapshot.docs.map((doc) => doc.data());
        setHistorial(datos);
      };

      cargarDatos();
      cargarHistorial();
      cargarGraficaSemanal();
    }, [])
  );

  const cerrarSesion = async () => {
    await signOut(FIREBASE_AUTH);
    navigation.replace("LogIn");
  };

  const mostrarToast = (mensaje) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(mensaje, ToastAndroid.SHORT);
    } else {
      Alert.alert(mensaje);
    }
  };

  const cobrarBeca = async () => {
    try {
      if (contador >= LIMITE_BECAS_DIARIO) {
        Alert.alert("Límite alcanzado", "Ya se cobraron las 70 becas del día.");
        return;
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const inicioHoy = Timestamp.fromDate(hoy);

      const q = query(
        collection(FIRESTORE_DB, "becas"),
        where("numero_control", "==", alumno.numero_control),
        where("fecha", ">=", inicioHoy)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        Alert.alert("Ya cobrada", "Este alumno ya recibió beca hoy.");
        return;
      }

      await registrarCobroBeca(alumno);
      mostrarToast(`✅ ${alumno.nombre} - beca cobrada`);
      setContador((prev) => prev + 1);
      await cargarGraficaSemanal();
      resetear();
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch (e) {
      console.error("❌ Error real:", e.message);
      Alert.alert("Error", e.message || "No se pudo registrar el cobro");
    }
  };
  const generarReportePDF = async () => {
  const hace7dias = new Date();
  hace7dias.setDate(hace7dias.getDate() - 6);
  hace7dias.setHours(0, 0, 0, 0);

  const q = query(
    collection(FIRESTORE_DB, "becas"),
    where("fecha", ">=", Timestamp.fromDate(hace7dias)),
    orderBy("fecha", "desc")
  );

  const snapshot = await getDocs(q);
  const datos = snapshot.docs.map((doc) => doc.data());

  const agrupado = {};

  datos.forEach((item) => {
    const fecha = item.fecha.toDate().toLocaleDateString("es-MX");
    if (!agrupado[fecha]) agrupado[fecha] = [];
    agrupado[fecha].push(item);
  });

  let html = `
    <h1 style="text-align:center;">Reporte Semanal de Becas</h1>
  `;

  Object.keys(agrupado).forEach((fecha) => {
    html += `<h2>${fecha}</h2><ul>`;
    agrupado[fecha].forEach((item) => {
      html += `<li><strong>${item.nombre}</strong> - ${item.numero_control} - ${item.carrera}</li>`;
    });
    html += `</ul>`;
  });

  try {
    const file = await RNHTMLtoPDF.convert({
      html,
      fileName: `Reporte_Becas_${Date.now()}`,
      directory: 'Documents',
    });

    Alert.alert("✅ PDF generado", `Guardado en: ${file.filePath}`);
    console.log("📄 PDF path:", file.filePath);
  } catch (err) {
    console.error("❌ Error al generar PDF:", err);
    Alert.alert("Error", "No se pudo generar el PDF.");
  }
};

  const obtenerResumenSemanal = (becas) => {
    const resumen = { lun: 0, mar: 0, mier: 0, jue: 0, vie: 0, sab: 0, dom: 0 };
    becas.forEach((item) => {
      const fecha = item.fecha.toDate();
      const dia = fecha.toLocaleDateString("es-MX", { weekday: "short" });
      if (resumen[dia] !== undefined) resumen[dia]++;
    });
    return resumen;
  };

  const cargarGraficaSemanal = async () => {
    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 6);
    hace7dias.setHours(0, 0, 0, 0);

    const q = query(
      collection(FIRESTORE_DB, "becas"),
      where("fecha", ">=", Timestamp.fromDate(hace7dias))
    );
    const snapshot = await getDocs(q);
    const datos = snapshot.docs.map((doc) => doc.data());
    setResumenSemanal(obtenerResumenSemanal(datos));
  };

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRightButton}>
          <TouchableOpacity style={styles.btnCerrarSesion} onPress={cerrarSesion}>
            <Text style={styles.btnText}>Cerrar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Cobro de Beca</Text>

        <TextInput
          style={styles.input}
          placeholder="Número de control"
          value={numeroControl}
          onChangeText={setNumeroControl}
        />

        <TouchableOpacity style={styles.btnBuscar} onPress={buscarAlumno}>
          <Text style={styles.btnText}>BUSCAR ALUMNO</Text>
        </TouchableOpacity>

        {alumno && (
          <View style={styles.card}>
            <Text style={styles.label}>Nombre: <Text style={styles.value}>{alumno.nombre}</Text></Text>
            <Text style={styles.label}>Carrera: <Text style={styles.value}>{alumno.carrera}</Text></Text>
            <Text style={styles.label}>Estado: <Text style={styles.value}>{alumno.estado_beca}</Text></Text>

            {alumno.estado_beca === "becario" ? (
              <TouchableOpacity style={styles.btnCobrar} onPress={cobrarBeca}>
                <Text style={styles.btnText}>COBRAR BECA</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: "red", marginTop: 10 }}>Este alumno no tiene beca.</Text>
            )}
          </View>
        )}

        <Text style={styles.contador}>
          Becas cobradas hoy: {contador}/{LIMITE_BECAS_DIARIO}
        </Text>

        {contador >= LIMITE_BECAS_DIARIO && (
          <View style={styles.alertaRoja}>
            <Text style={styles.alertaTexto}>⚠️ Límite diario de becas alcanzado</Text>
          </View>
        )}

        <Text style={styles.subTitle}>Últimos Cobros Registrados</Text>

        {/* Primeras 3 tarjetas con diseño especial */}
        <View style={{ marginTop: 10 }}>
          {historial.slice(0, 3).map((item, index) => (
            <View key={`preview-${index}`} style={styles.previewCard}>
              <Text style={styles.previewNombre}>✅ {item.nombre}</Text>
              <Text style={styles.previewDetalles}>
                {item.numero_control} • {item.carrera}
              </Text>
            </View>
          ))}
        </View>

        {/* Siguientes 7 tarjetas clásicas */}
        {historial.slice(3).map((item, index) => (
          <View key={`hist-${index}`} style={styles.historialCard}>
            <Text style={styles.cardTitle}>{item.nombre}</Text>
            <Text style={styles.cardDetail}>Control: {item.numero_control}</Text>
            <Text style={styles.cardDetail}>Carrera: {item.carrera}</Text>
            <Text style={styles.cardDetail}>Estado: {item.estado}</Text>
          </View>
        ))}

        {Object.keys(resumenSemanal).length > 0 && (
          <>
            <Text style={styles.subTitle}>Cobros por semana</Text>
            <LineChart
              data={{
                labels: ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
                datasets: [
                  {
                    data: [
                      resumenSemanal["lun"] || 0,
                      resumenSemanal["mar"] || 0,
                      resumenSemanal["mié"] || 0,
                      resumenSemanal["jue"] || 0,
                      resumenSemanal["vie"] || 0,
                      resumenSemanal["sáb"] || 0,
                      resumenSemanal["dom"] || 0,
                    ],
                  },
                ],
              }}
              width={screenWidth - 40}
              height={180}
              yAxisInterval={1}
              chartConfig={{
                backgroundGradientFrom: "#272121",
                backgroundGradientTo: "#FF4D00",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: "#fff",
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
              
  

          </>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  topRightButton: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#fff",
  },
  subTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "#ccc",
  },
  card: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  label: { fontWeight: "bold" },
  value: { fontWeight: "normal" },
  contador: {
    marginTop: 25,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
    color: "#fff",
  },
  alertaRoja: {
    marginTop: 10,
    backgroundColor: "#f8d7da",
    padding: 12,
    borderRadius: 10,
    borderColor: "#f5c6cb",
    borderWidth: 1,
  },
  btnReporte: {
  backgroundColor: "#443737",
  padding: 12,
  borderRadius: 8,
  marginTop: 10,
  alignItems: "center",
},
  alertaTexto: {
    color: "#721c24",
    fontWeight: "bold",
    textAlign: "center",
  },
  historialCard: {
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 3,
  },
  cardDetail: {
    fontSize: 14,
    color: "#444",
  },
  btnBuscar: {
    backgroundColor: "#FF4D00",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  btnCobrar: {
    backgroundColor: "#FF4D00",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  btnCerrarSesion: {
    backgroundColor: "#FF4D00",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  previewCard: {
    backgroundColor: "#272121",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  previewNombre: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  previewDetalles: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 2,
  },
});

export default HomeCafeteria;
