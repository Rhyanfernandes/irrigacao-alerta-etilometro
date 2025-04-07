import { getEmployees, getTests, getDraws, getSites } from './storage';
import {
  saveEmployeeToSupabase,
  saveTestToSupabase,
  saveDrawToSupabase,
  saveSiteToSupabase,
} from './supabase-storage';

export const migrateDataToSupabase = async () => {
  try {
    // Migrar funcionários
    const employees = await getEmployees();
    for (const employee of employees) {
      await saveEmployeeToSupabase(employee);
    }
    console.log(`${employees.length} funcionários migrados`);

    // Migrar testes
    const tests = await getTests();
    for (const test of tests) {
      await saveTestToSupabase(test);
    }
    console.log(`${tests.length} testes migrados`);

    // Migrar sorteios
    const draws = await getDraws();
    for (const draw of draws) {
      await saveDrawToSupabase(draw);
    }
    console.log(`${draws.length} sorteios migrados`);

    // Migrar obras
    const sites = await getSites();
    for (const site of sites) {
      await saveSiteToSupabase(site);
    }
    console.log(`${sites.length} obras migradas`);

    return true;
  } catch (error) {
    console.error('Erro ao migrar dados para o Supabase:', error);
    return false;
  }
}; 