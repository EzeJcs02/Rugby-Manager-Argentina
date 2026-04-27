import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClubContext = createContext(null);

export function ClubProvider({ children }) {
  const [clubId, setClubId] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('rma_clubId').then(val => {
      if (val) setClubId(parseInt(val));
      setLoaded(true);
    });
  }, []);

  const selectClub = async (id) => {
    await AsyncStorage.setItem('rma_clubId', String(id));
    setClubId(id);
  };

  const clearClub = async () => {
    await AsyncStorage.removeItem('rma_clubId');
    setClubId(null);
  };

  return (
    <ClubContext.Provider value={{ clubId, selectClub, clearClub, loaded }}>
      {children}
    </ClubContext.Provider>
  );
}

export const useClub = () => useContext(ClubContext);
