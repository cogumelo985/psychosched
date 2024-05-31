import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Image, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Página de login
const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const storedUsername = await AsyncStorage.getItem('username');
    const storedPassword = await AsyncStorage.getItem('password');

    if (username === storedUsername && password === storedPassword) {
      navigation.navigate('Home');
    } else {
      alert('Login ou senha inválidos');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: 'https://snack-code-uploads.s3.us-west-1.amazonaws.com/~asset/a017a3d7f2551af78ad4767e36c990ac' }} style={styles.logo} />
      <Text style={styles.text}>Login</Text>
      <TextInput
        placeholder="Username"
        onChangeText={setUsername}
        value={username}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry={true}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Criar Conta" onPress={() => navigation.navigate('SignUp')} />
    </View>
  );
};

// Página de cadastro
const SignUpScreen = ({ navigation }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSignUp = async () => {
    await AsyncStorage.setItem('username', newUsername);
    await AsyncStorage.setItem('password', newPassword);
    navigation.navigate('TakePhoto');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Criar Conta</Text>
      <TextInput
        placeholder="Username"
        onChangeText={setNewUsername}
        value={newUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setNewPassword}
        value={newPassword}
        secureTextEntry={true}
        style={styles.input}
      />
      <Button title="Cadastrar" onPress={handleSignUp} />
    </View>
  );
};

// Página para tirar foto do rosto
const TakePhotoScreen = ({ navigation }) => {
  const [imageUri, setImageUri] = useState(null);

  const handleTakePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      setImageUri(result.uri);
      alert('Conta criada com sucesso');
      navigation.navigate('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tire uma foto do seu rosto</Text>
      <Button title="Tirar Foto" onPress={handleTakePhoto} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </View>
  );
};

// Página Home com barra de pesquisa de médicos
const HomeScreen = ({ navigation }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const savedUsername = await AsyncStorage.getItem('username');
    if (!savedUsername) {
      Alert.alert('Aviso', 'Você precisa estar logado para acessar esta página.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } else {
      setIsLoggedIn(true);
    }
  };

  const handleDoctorSelection = (doctor) => {
    if (isLoggedIn) {
      navigation.navigate('Calendar', { doctor });
    } else {
      Alert.alert('Aviso', 'Você precisa estar logado para selecionar um médico.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    }
  };

  const doctors = [
    { name: 'Roberto', specialty: 'Psicólogo' },
    { name: 'Monica', specialty: 'Psicólogo' },
    { name: 'Nathan', specialty: 'Psicólogo' }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Buscar Médicos</Text>
      <FlatList
        data={doctors}
        renderItem={({ item }) => (
          <Button
            title={`${item.name} - ${item.specialty}`}
            onPress={() => handleDoctorSelection(item)}
          />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

// Página de calendário para seleção de data
const CalendarScreen = ({ navigation, route }) => {
  const { doctor } = route.params;

  const handleDayPress = (day) => {
    if (['2024-06-12', '2024-06-13', '2024-06-14', '2024-06-15', '2024-06-16'].includes(day.dateString)) {
      navigation.navigate('TimeSlots', { doctor, selectedDate: day.dateString });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selecione uma data para a consulta com Dr. {doctor.name}</Text>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          '2024-06-12': { selected: true },
          '2024-06-13': { selected: true },
          '2024-06-14': { selected: true },
          '2024-06-15': { selected: true },
          '2024-06-16': { selected: true }
        }}
      />
    </View>
  );
};

// Página de seleção de horários
const TimeSlotsScreen = ({ navigation, route }) => {
  const { doctor, selectedDate } = route.params;

  const handleTimeSlotSelection = async (time) => {
    const username = await AsyncStorage.getItem('username');
    const appointmentKey = `${username}-${doctor.name}-${selectedDate}`;
    const existingAppointment = await AsyncStorage.getItem(appointmentKey);

    if (existingAppointment) {
      alert(`Você já marcou uma consulta com Dr. ${doctor.name} em ${selectedDate} às ${existingAppointment}`);
    } else {
      await AsyncStorage.setItem(appointmentKey, time);
      alert(`Consulta marcada com Dr. ${doctor.name} em ${selectedDate} às ${time}`);
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Selecione um horário para a consulta com Dr. {doctor.name} em {selectedDate}</Text>
      <Button title="14h" onPress={() => handleTimeSlotSelection('14h')} />
      <Button title="15h" onPress={() => handleTimeSlotSelection('15h')} />
      <Button title="16h" onPress={() => handleTimeSlotSelection('16h')} />
    </View>
  );
};

const Stack = createStackNavigator();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="TakePhoto" component={TakePhotoScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="TimeSlots" component={TimeSlotsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  input: {
    width: '80%',
    marginBottom: 20,
    borderWidth: 1,
    padding: 10
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 100
  },
  text: {
    color: 'red', // Definindo a cor vermelha
    fontFamily: 'Times New Roman', // Definindo a fonte
    fontSize: 18 // Tamanho da fonte
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20
  }
});

export default App;
