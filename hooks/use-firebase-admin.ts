import { useState, useEffect } from 'react';
import { ref, onValue, off, get } from 'firebase/database';
import { database } from '@/lib/firebase';

/**
 * Dados agregados para o dashboard administrativo
 */
export interface AdminDashboardStats {
  totalEmployees: number;
  activeToday: number;
  checkInsToday: number;
  hydrationAverage: number;
  complaintsThisWeek: number;
  challengesActive: number;
  ergonomicsAdherence: number;
  mentalHealthUsage: number;
}

/**
 * Dados de um funcionário para o dashboard
 */
export interface AdminEmployeeRecord {
  id: string;
  name: string;
  matricula: string;
  position?: string;
  turno?: string;
  lastCheckIn: string | null;
  hydrationToday: number;
  hydrationGoal: number;
  lastPressure: { systolic: number; diastolic: number; date: string } | null;
  complaintsCount: number;
  challengesActive: number;
}

/**
 * Hook para buscar dados agregados de todos os funcionários do Firebase
 * Atualiza em tempo real quando há mudanças
 */
export function useFirebaseAdmin() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalEmployees: 0,
    activeToday: 0,
    checkInsToday: 0,
    hydrationAverage: 0,
    complaintsThisWeek: 0,
    challengesActive: 0,
    ergonomicsAdherence: 0,
    mentalHealthUsage: 0,
  });
  
  const [employees, setEmployees] = useState<AdminEmployeeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[Firebase Admin] Iniciando listener de dados');
    
    const employeesRef = ref(database, 'canteiro-saudavel/employees');
    
    // Listener em tempo real
    const unsubscribe = onValue(
      employeesRef,
      (snapshot) => {
        try {
          if (!snapshot.exists()) {
            console.log('[Firebase Admin] Nenhum funcionário encontrado');
            setEmployees([]);
            setStats({
              totalEmployees: 0,
              activeToday: 0,
              checkInsToday: 0,
              hydrationAverage: 0,
              complaintsThisWeek: 0,
              challengesActive: 0,
              ergonomicsAdherence: 0,
              mentalHealthUsage: 0,
            });
            setIsLoading(false);
            return;
          }

          const data = snapshot.val();
          const today = new Date().toISOString().split('T')[0];
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          const employeesList: AdminEmployeeRecord[] = [];
          let totalHydration = 0;
          let hydrationCount = 0;
          let checkInsToday = 0;
          let complaintsThisWeek = 0;
          let challengesActive = 0;

          // Processar cada funcionário
          Object.keys(data).forEach((matricula) => {
            const empData = data[matricula];
            const profile = empData.profile || {};
            
            // Check-ins de hoje
            const checkins = empData.checkins || {};
            const todayCheckins = Object.values(checkins).filter(
              (c: any) => c.date === today
            );
            if (todayCheckins.length > 0) {
              checkInsToday++;
            }
            
            // Hidratação de hoje (Nova estrutura: hydration/{date}/waterIntake)
            const hydrationToday = empData.hydration && empData.hydration[today] 
              ? (empData.hydration[today].waterIntake || 0) : 0;
            const hydrationGoal = empData.hydration && empData.hydration[today]
              ? (empData.hydration[today].goal || 2000) : 2000;
            
            if (hydrationToday > 0) {
              totalHydration += hydrationToday;
              hydrationCount++;
            }
            
            // Pressão arterial mais recente (Nova estrutura: pressure/{timestamp})
            const pressure = empData.pressure || {};
            const bpRecords = Object.values(pressure).sort(
              (a: any, b: any) => b.timestamp - a.timestamp
            );
            const lastPressure = bpRecords.length > 0
              ? {
                  systolic: (bpRecords[0] as any).systolic,
                  diastolic: (bpRecords[0] as any).diastolic,
                  date: (bpRecords[0] as any).date || new Date((bpRecords[0] as any).timestamp).toISOString().split('T')[0],
                }
              : null;
            
            // Queixas da semana (Nova estrutura: complaints/{timestamp})
            const complaints = empData.complaints || {};
            const weekSymptoms = Object.values(complaints).filter(
              (s: any) => (s.date || new Date(s.timestamp).toISOString().split('T')[0]) >= weekAgo
            );
            complaintsThisWeek += weekSymptoms.length;
            
            // Desafios ativos (TODO: implementar quando houver sistema de desafios)
            challengesActive += 0;
            
            employeesList.push({
              id: matricula,
              name: profile.name || 'Sem nome',
              matricula: matricula,
              position: profile.position,
              turno: profile.turno,
              lastCheckIn: todayCheckins.length > 0 ? today : null,
              hydrationToday,
              hydrationGoal,
              lastPressure,
              complaintsCount: weekSymptoms.length,
              challengesActive: empData.challenges ? Object.keys(empData.challenges).length : 0,
            });
          });

          // Calcular estatísticas agregadas
          const totalEmployees = employeesList.length;
          const activeToday = checkInsToday;
          const hydrationAverage = hydrationCount > 0
            ? Math.round(totalHydration / hydrationCount)
            : 0;

          setEmployees(employeesList);
          setStats({
            totalEmployees,
            activeToday,
            checkInsToday,
            hydrationAverage,
            complaintsThisWeek,
            challengesActive,
            ergonomicsAdherence: 0, // TODO: implementar
            mentalHealthUsage: 0, // TODO: implementar
          });
          
          console.log(`[Firebase Admin] ${totalEmployees} funcionários carregados`);
          console.log(`[Firebase Admin] ${activeToday} ativos hoje`);
          console.log(`[Firebase Admin] ${hydrationAverage}ml hidratação média`);
          
          setIsLoading(false);
          setError(null);
        } catch (err) {
          console.error('[Firebase Admin] Erro ao processar dados:', err);
          setError('Erro ao processar dados do Firebase');
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('[Firebase Admin] Erro no listener:', err);
        setError('Erro ao conectar com Firebase');
        setIsLoading(false);
      }
    );

    // Cleanup: remover listener quando componente desmontar
    return () => {
      console.log('[Firebase Admin] Removendo listener');
      off(employeesRef);
    };
  }, []);

  /**
   * Forçar atualização manual dos dados
   */
  const refresh = async () => {
    setIsLoading(true);
    try {
      const employeesRef = ref(database, 'canteiro-saudavel/employees');
      const snapshot = await get(employeesRef);
      
      // O listener já vai processar os dados automaticamente
      console.log('[Firebase Admin] Refresh manual solicitado');
    } catch (err) {
      console.error('[Firebase Admin] Erro no refresh:', err);
      setError('Erro ao atualizar dados');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    employees,
    isLoading,
    error,
    refresh,
  };
}
