import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { FIREBASE_AUTH, FIRESTORE_DB } from "../../services/firebaseConfig";
import { signOut } from "firebase/auth";
import { fetchCurrentUserData } from "../../services/userService";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const HomeAlumno = () => {
  const [alumno, setAlumno] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const userData = await fetchCurrentUserData();
        setAlumno(userData);

        const q = query(
          collection(FIRESTORE_DB, "becas"),
          where("numero_control", "==", userData.numero_control),
          orderBy("fecha", "desc")
        );
        const snapshot = await getDocs(q);
        const cobros = snapshot.docs.map((doc) => doc.data());
        setHistorial(cobros);
      } catch (error) {
        console.error("Error al cargar historial:", error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const cerrarSesion = async () => {
    await signOut(FIREBASE_AUTH);
    navigation.replace("LogIn");
  };

  const agruparPorFecha = (data) => {
    const conteo = {};
    data.forEach((item) => {
      const fecha = item.fecha.toDate().toLocaleDateString("es-MX", {
        weekday: "short",
        day: "2-digit",
      });
      conteo[fecha] = (conteo[fecha] || 0) + 1;
    });
    return conteo;
  };

  const datosAgrupados = agruparPorFecha(historial);
  const labels = Object.keys(datosAgrupados).reverse().slice(0, 7);
  const values = labels.map((lbl) => datosAgrupados[lbl]);

  return (
    <ImageBackground
      source={require("../../assets/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.logoutButton} onPress={cerrarSesion}>
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 20 }}>
          {alumno && (
            <View style={styles.card}>
              <Text style={styles.title}>
                <Icon name="person-circle-outline" size={20} /> Bienvenido,{" "}
                <Text style={{ fontWeight: "bold" }}>{alumno.nombre}</Text>
              </Text>
              <Text style={styles.info}>Número de control: {alumno.numero_control}</Text>
              <Text style={styles.info}>Carrera: {alumno.carrera}</Text>
              <Text style={styles.info}>Estado de beca: {alumno.estado_beca}</Text>
            </View>
          )}

          <Text style={styles.subtitle}>
            <Icon name="calendar-outline" size={18} /> Historial de becas
          </Text>

          {loading ? (
            <ActivityIndicator size="large" color="#FF4D00" />
          ) : historial.length === 0 ? (
            <Text style={styles.noData}>📭 Aún no has recibido ninguna beca.</Text>
          ) : (
            <>
              {historial.slice(0, 5).map((item, index) => (
                <View style={styles.historialCard} key={index}>
                  <Text style={styles.cardTitle}>{item.estado}</Text>
                  <Text style={styles.cardDetail}>
                    Fecha: {item.fecha.toDate().toLocaleString()}
                  </Text>
                </View>
              ))}

              <Text style={styles.subtitle}>📈 Gráfico semanal</Text>
              <LineChart
                data={{
                  labels,
                  datasets: [{ data: values }],
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
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 40,
    paddingTop: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#272121",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#272121",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#fff",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
  },
  info: {
    fontSize: 14,
    color: "#444",
    marginTop: 2,
  },
  historialCard: {
    backgroundColor: "#fdfdfd",
    padding: 12,
    marginVertical: 6,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF0000",
  },
  cardDetail: {
    fontSize: 14,
    color: "#444",
  },
  noData: {
    textAlign: "center",
    marginTop: 10,
    color: "#fff",
    fontStyle: "italic",
  },
});

export default HomeAlumno;
