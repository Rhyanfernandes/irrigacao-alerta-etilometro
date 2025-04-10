
import { supabase } from '@/integrations/supabase/client';
import { Employee, TestResult, DrawResult, Site } from '@/types';
import { getCurrentUser } from './auth';

// Funções para funcionários
export const getEmployeesFromSupabase = async (): Promise<Employee[]> => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  let query = supabase.from('employees').select('*');
  
  // Se for usuário de obra, filtra apenas os funcionários da obra
  if (user.role === 'site' && user.siteId) {
    query = query.eq('site_id', user.siteId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar funcionários:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map((employee: any) => ({
    id: employee.id,
    name: employee.name || '',
    position: employee.position || employee.role || '',
    department: employee.department || '',
    registerNumber: employee.register_number || employee.cpf || '',
    status: employee.status || 'active',
    active: employee.active !== undefined ? employee.active : true,
    siteId: employee.site_id,
    siteName: employee.site_name,
    createdAt: new Date(employee.created_at),
  }));
};

export const saveEmployeeToSupabase = async (employee: Employee): Promise<Employee | null> => {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  // Se for usuário de obra, atribui a obra ao funcionário
  if (user.role === 'site' && !employee.siteId) {
    employee.siteId = user.siteId;
    employee.siteName = user.siteName;
  }
  
  const employeeData = {
    id: employee.id,
    name: employee.name,
    position: employee.position,
    department: employee.department,
    register_number: employee.registerNumber,
    cpf: employee.registerNumber,
    status: employee.status,
    active: employee.active,
    site_id: employee.siteId,
    site_name: employee.siteName,
    created_at: employee.createdAt.toISOString(),
  };
  
  const { data, error } = await supabase
    .from('employees')
    .upsert(employeeData)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao salvar funcionário:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name || '',
    position: data.position || data.role || '',
    department: data.department || '',
    registerNumber: data.register_number || data.cpf || '',
    status: data.status || 'active',
    active: data.active !== undefined ? data.active : true,
    siteId: data.site_id,
    siteName: data.site_name,
    createdAt: new Date(data.created_at),
  };
};

export const deleteEmployeeFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir funcionário:', error);
    return false;
  }
  
  return true;
};

// Funções para testes
export const getTestsFromSupabase = async (): Promise<TestResult[]> => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  let query = supabase.from('tests').select('*');
  
  // Se for usuário de obra, filtra apenas os testes da obra
  if (user.role === 'site' && user.siteId) {
    query = query.eq('site_id', user.siteId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar testes:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map((test: any) => ({
    id: test.id,
    employeeId: test.employee_id,
    employeeName: test.employee_name || '',
    date: new Date(test.date),
    time: test.time || new Date(test.date).toTimeString().slice(0, 5),
    result: test.result,
    alcoholLevel: test.alcohol_level,
    notes: test.notes || '',
    siteId: test.site_id,
    siteName: test.site_name || '',
    createdAt: new Date(test.created_at),
    updatedAt: new Date(test.updated_at || test.created_at),
  }));
};

export const saveTestToSupabase = async (test: TestResult): Promise<TestResult | null> => {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  // Se for usuário de obra, atribui a obra ao teste
  if (user.role === 'site' && !test.siteId) {
    test.siteId = user.siteId;
    test.siteName = user.siteName;
  }
  
  const testData = {
    id: test.id,
    employee_id: test.employeeId,
    employee_name: test.employeeName,
    date: test.date.toISOString(),
    time: test.time,
    result: test.result,
    alcohol_level: test.alcoholLevel,
    notes: test.notes,
    site_id: test.siteId,
    site_name: test.siteName,
    created_at: test.createdAt.toISOString(),
    updated_at: test.updatedAt.toISOString(),
  };
  
  try {
    const { data, error } = await supabase
      .from('tests')
      .upsert(testData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar teste:', error);
      return null;
    }
    
    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: data.employee_name || '',
      date: new Date(data.date),
      time: data.time || new Date(data.date).toTimeString().slice(0, 5),
      result: data.result,
      alcoholLevel: data.alcohol_level,
      notes: data.notes || '',
      siteId: data.site_id,
      siteName: data.site_name || '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at || data.created_at),
    };
  } catch (e) {
    console.error('Exceção ao salvar teste:', e);
    return null;
  }
};

export const deleteTestFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tests')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir teste:', error);
    return false;
  }
  
  return true;
};

// Funções para sorteios
export const getDrawsFromSupabase = async (): Promise<DrawResult[]> => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  let query = supabase.from('draws').select('*');
  
  // Se for usuário de obra, filtra apenas os sorteios da obra
  if (user.role === 'site' && user.siteId) {
    query = query.eq('site_id', user.siteId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar sorteios:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map((draw: any) => ({
    id: draw.id,
    date: new Date(draw.date),
    employees: [], // Array vazio, será preenchido com os funcionários quando necessário
    employeeIds: draw.employee_ids || [],
    employeeNames: draw.employee_names || [],
    notes: draw.notes || '',
    siteId: draw.site_id,
    siteName: draw.site_name || '',
    createdAt: new Date(draw.created_at),
  }));
};

export const saveDrawToSupabase = async (draw: DrawResult): Promise<DrawResult | null> => {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  // Se for usuário de obra, atribui a obra ao sorteio
  if (user.role === 'site' && !draw.siteId) {
    draw.siteId = user.siteId;
    draw.siteName = user.siteName;
  }
  
  const drawData = {
    id: draw.id,
    date: draw.date.toISOString(),
    employee_ids: draw.employeeIds,
    employee_names: draw.employeeNames,
    notes: draw.notes,
    site_id: draw.siteId,
    site_name: draw.siteName,
    created_at: draw.createdAt.toISOString(),
  };
  
  try {
    const { data, error } = await supabase
      .from('draws')
      .upsert(drawData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar sorteio:', error);
      return null;
    }
    
    return {
      id: data.id,
      date: new Date(data.date),
      employees: [], // Array vazio, será preenchido com os funcionários quando necessário
      employeeIds: data.employee_ids || [],
      employeeNames: data.employee_names || [],
      notes: data.notes || '',
      siteId: data.site_id,
      siteName: data.site_name || '',
      createdAt: new Date(data.created_at),
    };
  } catch (e) {
    console.error('Exceção ao salvar sorteio:', e);
    return null;
  }
};

export const deleteDrawFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('draws')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir sorteio:', error);
    return false;
  }
  
  return true;
};

// Funções para obras
export const getSitesFromSupabase = async (): Promise<Site[]> => {
  const { data, error } = await supabase
    .from('sites')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar obras:', error);
    return [];
  }
  
  if (!data) return [];
  
  return data.map((site: any) => ({
    id: site.id,
    name: site.name,
    location: site.address || '',
    createdAt: new Date(site.created_at),
  }));
};

export const saveSiteToSupabase = async (site: Site): Promise<Site | null> => {
  const siteData = {
    id: site.id,
    name: site.name,
    address: site.location,
    created_at: site.createdAt.toISOString(),
  };
  
  const { data, error } = await supabase
    .from('sites')
    .upsert(siteData)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao salvar obra:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    location: data.address || '',
    createdAt: new Date(data.created_at),
  };
};

export const deleteSiteFromSupabase = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Erro ao excluir obra:', error);
    return false;
  }
  
  return true;
};
