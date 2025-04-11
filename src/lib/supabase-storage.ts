import { supabase } from '@/integrations/supabase/client';
import { Employee, TestResult, DrawResult, Site } from '@/types';
import { getCurrentUser } from './auth';

// Funções para funcionários
export const getEmployeesFromSupabase = async (): Promise<Employee[]> => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  try {
    // Construir a query básica
    let query = supabase.from('employees').select('*');
    
    // Se for usuário de obra, filtra apenas os funcionários da obra
    if (user.role === 'site' && user.siteId) {
      console.log('Filtrando funcionários da obra do usuário:', user.siteId);
      query = query.eq('site_id', user.siteId);
    }
    // Para usuário master, retornamos todos, o filtro será feito no frontend
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Erro ao buscar funcionários:', error);
      return [];
    }
    
    if (!data) return [];
    
    // Carregar nomes das obras para todos os funcionários
    const siteIds = [...new Set(data.map(emp => emp.site_id).filter(Boolean))];
    let sitesMap: Record<string, string> = {};
    
    if (siteIds.length > 0) {
      const { data: sitesData } = await supabase
        .from('sites')
        .select('id, name')
        .in('id', siteIds);
      
      if (sitesData) {
        sitesMap = sitesData.reduce((acc: Record<string, string>, site: any) => {
          acc[site.id] = site.name;
          return acc;
        }, {});
      }
    }
    
    // Mapeando dados do Supabase para a estrutura da aplicação
    return data.map((employee: any) => ({
      id: employee.id,
      name: employee.name || '',
      position: employee.role || '',
      department: '', // A coluna department não existe no banco, usando valor padrão vazio
      registerNumber: employee.cpf || '',
      status: employee.active === false ? 'inactive' : 'active',
      active: employee.active !== false,
      siteId: employee.site_id,
      siteName: sitesMap[employee.site_id] || '',
      createdAt: new Date(employee.created_at),
    }));
  } catch (e) {
    console.error('Exceção ao buscar funcionários:', e);
    return [];
  }
};

export const saveEmployeeToSupabase = async (employee: Employee): Promise<Employee | null> => {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  console.log('Salvando funcionário no Supabase:', employee);
  
  // Verificar permissão - usuários de obra só podem salvar funcionários da sua obra
  if (user.role === 'site' && user.siteId) {
    // Forçar o siteId do usuário para evitar mudanças não autorizadas
    employee.siteId = user.siteId;
    employee.siteName = user.siteName || '';
  }
  
  // Se ainda não há um siteId definido (caso raro), tentar usar o do usuário 
  if (!employee.siteId) {
    // Verificar se o usuário master tem uma obra selecionada
    if (user.role === 'master') {
      const selectedSiteId = localStorage.getItem('irricom_selected_site');
      if (selectedSiteId) {
        employee.siteId = selectedSiteId;
        // Buscar o nome da obra
        const { data } = await supabase
          .from('sites')
          .select('name')
          .eq('id', selectedSiteId)
          .single();
        
        if (data) {
          employee.siteName = data.name;
        }
      }
    } 
    // Se for usuário de obra, atribui a obra ao funcionário
    else if (user.role === 'site') {
      employee.siteId = user.siteId;
      employee.siteName = user.siteName;
    }
  }

  // Se ainda não temos uma obra, tentar usar a primeira disponível
  if (!employee.siteId) {
    const { data: sites } = await supabase.from('sites').select('id, name').limit(1);
    if (sites && sites.length > 0) {
      employee.siteId = sites[0].id;
      employee.siteName = sites[0].name;
      console.log('Atribuindo primeira obra disponível:', sites[0].name);
    } else {
      console.error('Não foi possível salvar o funcionário - nenhuma obra disponível');
      return null;
    }
  }
  
  // Apenas os campos que existem na tabela do Supabase
  const employeeData = {
    id: employee.id,
    name: employee.name,
    role: employee.position,
    cpf: employee.registerNumber,
    site_id: employee.siteId,
    created_at: employee.createdAt.toISOString(),
  };
  
  console.log('Dados enviados para o Supabase:', employeeData);
  
  try {
    const { data, error } = await supabase
      .from('employees')
      .upsert(employeeData)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar funcionário:', error);
      return null;
    }
    
    console.log('Funcionário salvo com sucesso:', data);
    
    return {
      id: data.id,
      name: data.name || '',
      position: data.role || '',
      department: '', // A coluna department não existe no banco, usando valor padrão vazio
      registerNumber: data.cpf || '',
      status: 'active', // Status padrão, já que não existe no banco
      active: true, // Active padrão, já que não existe no banco
      siteId: data.site_id,
      siteName: employee.siteName || '',
      createdAt: new Date(data.created_at),
    };
  } catch (e) {
    console.error('Exceção ao salvar funcionário:', e);
    return null;
  }
};

export const deleteEmployeeFromSupabase = async (id: string): Promise<boolean> => {
  const user = await getCurrentUser();
  
  if (!user) return false;
  
  try {
    // Verificar se o usuário tem permissão para excluir este funcionário
    if (user.role === 'site' && user.siteId) {
      // Verificar se o funcionário pertence à mesma obra do usuário
      const { data: employee } = await supabase
        .from('employees')
        .select('site_id')
        .eq('id', id)
        .single();
      
      if (!employee || employee.site_id !== user.siteId) {
        console.error('Usuário não tem permissão para excluir este funcionário');
        return false;
      }
    }
    
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir funcionário:', error);
      return false;
    }
    
    return true;
  } catch (e) {
    console.error('Exceção ao excluir funcionário:', e);
    return false;
  }
};

// Funções para testes
export const getTestsFromSupabase = async (): Promise<TestResult[]> => {
  const user = await getCurrentUser();
  
  if (!user) return [];
  
  let query = supabase.from('tests')
    .select(`
      *,
      employees(name),
      sites(name)
    `);
  
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
  
  // Mapeando dados do Supabase para a estrutura da aplicação
  return data.map((test: any) => {
    // Extraindo o nome do funcionário da relação
    const employeeName = test.employees?.name || '';
    // Extraindo o nome da obra da relação
    const siteName = test.sites?.name || '';
    
    return {
      id: test.id,
      employeeId: test.employee_id,
      employeeName: employeeName,
      date: new Date(test.date),
      // Se não existe campo time, usar a hora da data
      time: new Date(test.date).toTimeString().slice(0, 5),
      // Forçando o tipo para "positive" ou "negative"
      result: (test.result === "positive" ? "positive" : "negative") as "positive" | "negative",
      alcoholLevel: test.alcohol_level,
      // Se não existe campo notes, usar string vazia
      notes: '',
      siteId: test.site_id,
      // Usar o nome da obra obtido da relação
      siteName: siteName,
      createdAt: new Date(test.created_at),
      // Se não existe campo updated_at, usar created_at
      updatedAt: new Date(test.created_at),
    };
  });
};

export const saveTestToSupabase = async (test: TestResult): Promise<TestResult | null> => {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  // Se for usuário de obra, atribui a obra ao teste
  if (user.role === 'site' && !test.siteId) {
    test.siteId = user.siteId;
    test.siteName = user.siteName;
  }
  
  // Apenas os campos que existem na tabela do Supabase
  const testData = {
    id: test.id,
    employee_id: test.employeeId,
    date: test.date.toISOString(),
    result: test.result,
    alcohol_level: test.alcoholLevel,
    site_id: test.siteId,
    created_at: test.createdAt.toISOString(),
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
    
    // Após salvar, buscar o nome do funcionário
    const employeeResponse = await supabase
      .from('employees')
      .select('name')
      .eq('id', data.employee_id)
      .single();

    const employeeName = employeeResponse.data?.name || '';
    
    // Adaptação do retorno para o formato da aplicação
    return {
      id: data.id,
      employeeId: data.employee_id,
      employeeName: employeeName,
      date: new Date(data.date),
      time: new Date(data.date).toTimeString().slice(0, 5),
      result: (data.result === "positive" ? "positive" : "negative") as "positive" | "negative",
      alcoholLevel: data.alcohol_level,
      notes: '',
      siteId: data.site_id,
      siteName: '',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.created_at),
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
  
  // Buscar primeiro os sorteios
  let drawsQuery = supabase.from('draws').select('*, sites(name)');
  
  // Se for usuário de obra, filtra apenas os sorteios da obra
  if (user.role === 'site' && user.siteId) {
    drawsQuery = drawsQuery.eq('site_id', user.siteId);
  }
  
  const { data: drawsData, error: drawsError } = await drawsQuery;
  
  if (drawsError) {
    console.error('Erro ao buscar sorteios:', drawsError);
    return [];
  }
  
  if (!drawsData || drawsData.length === 0) return [];
  
  // Para cada sorteio, buscar informações do funcionário
  const draws = await Promise.all(drawsData.map(async (draw: any) => {
    // Buscar funcionário relacionado se houver employee_id
    let employee = null;
    let employeeIds: string[] = [];
    let employeeNames: string[] = [];
    
    if (draw.employee_id) {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('*')
        .eq('id', draw.employee_id)
        .single();
      
      if (employeeData) {
        employee = {
          id: employeeData.id,
          name: employeeData.name,
          position: employeeData.role || '',
          department: '',
          registerNumber: employeeData.cpf || '',
          status: 'active',
          active: true,
          siteId: employeeData.site_id,
          siteName: '',
          createdAt: new Date(employeeData.created_at),
        };
        
        employeeIds = [employeeData.id];
        employeeNames = [employeeData.name];
      }
    }
    
    return {
      id: draw.id,
      date: new Date(draw.date),
      employees: employee ? [employee] : [],
      employeeIds: employeeIds,
      employeeNames: employeeNames,
      notes: '',
      siteId: draw.site_id,
      siteName: draw.sites?.name || '',
      createdAt: new Date(draw.created_at),
    };
  }));
  
  return draws;
};

export const saveDrawToSupabase = async (draw: DrawResult): Promise<DrawResult | null> => {
  const user = await getCurrentUser();
  
  if (!user) return null;
  
  // Se for usuário de obra, atribui a obra ao sorteio
  if (user.role === 'site' && !draw.siteId) {
    draw.siteId = user.siteId;
    draw.siteName = user.siteName;
  }
  
  // Usar o primeiro funcionário sorteado como employee_id
  const employeeId = draw.employeeIds.length > 0 ? draw.employeeIds[0] : null;
  
  // Apenas os campos que existem na tabela do Supabase
  const drawData = {
    id: draw.id,
    date: draw.date.toISOString(),
    employee_id: employeeId,
    site_id: draw.siteId,
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
    
    // Buscar informações do funcionário
    let employee = null;
    let employeeNames: string[] = [];
    
    if (data.employee_id) {
      const { data: employeeData } = await supabase
        .from('employees')
        .select('*')
        .eq('id', data.employee_id)
        .single();
      
      if (employeeData) {
        employee = {
          id: employeeData.id,
          name: employeeData.name,
          position: employeeData.role || '',
          department: '',
          registerNumber: employeeData.cpf || '',
          status: 'active',
          active: true,
          siteId: employeeData.site_id,
          siteName: '',
          createdAt: new Date(employeeData.created_at),
        };
        
        employeeNames = [employeeData.name];
      }
    }
    
    // Adaptação do retorno para o formato da aplicação
    return {
      id: data.id,
      date: new Date(data.date),
      employees: employee ? [employee] : [],
      employeeIds: data.employee_id ? [data.employee_id] : [],
      employeeNames: employeeNames,
      notes: '',
      siteId: data.site_id,
      siteName: '',
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
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .order('name');
    
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
  } catch (e) {
    console.error('Exceção ao buscar obras:', e);
    return [];
  }
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
