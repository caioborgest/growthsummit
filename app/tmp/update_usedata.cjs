const fs = require('fs');
const filePath = 'c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\src\\hooks\\useData.ts';

let content = fs.readFileSync(filePath, 'utf8');

// mentors
content = content.replace(
    /'id,project_id,user_id,nome,email,telefone,empresa,cargo,especialidades,bio,linkedin_url,foto_url,status,created_at,years_experience,max_mentories'/g,
    "'id,project_id,user_id,name,email,phone,company,role,specialties,bio,linkedin_url,photo_url,status,created_at,years_experience,max_mentories'"
);

// empresas_incentivadoras
content = content.replace(
    /'id,project_id,nome_responsavel,email,telefone,company_name,quantidade_equipe,quantidade_dia,quantidade_noite,objetivo,status,valor_investido,created_at'/g,
    "'id,project_id,responsible_name,email,phone,company_name,quantidade_equipe,quantidade_dia,quantidade_noite,objetivo,status,paid_amount,created_at'"
);

// mentoring_sessions specific to GE
content = content.replace(
    /'id,project_id,mentorado_id,mentor_id,nome_mentorado,email_mentorado,telefone_mentorado,tema_interesse,anotacoes,status,created_at,data_mentoria,duracao,avaliacao_mentoria,indicacao_mentor,avaliado_em'/g,
    "'id,project_id,mentee_id,mentor_id,mentee_name,mentee_email,mentee_phone,topic,notes,status,created_at,start_date,duration,mentoring_rating,mentor_indication,rated_at'"
);

// registrations fields block
content = content.replace(
    /registrations: 'id,project_id,user_id,ticket_type,status,ticket_number,qr_code,amount,payment_method,payment_date,checked_in,check_in_at,created_at'/g,
    "registrations: 'id,project_id,user_id,registration_type,status,ticket_number,qr_code,paid_amount,payment_method,payment_date,checked_in,check_in_at,created_at'"
);

// mentors fields block
content = content.replace(
    /mentors: 'id,project_id,user_id,name,email,phone,company,position,specialties,tracks,years_experience,status,max_mentories,photo,created_at'/g,
    "mentors: 'id,project_id,user_id,name,email,phone,company,role,specialties,tracks,years_experience,status,max_mentories,photo_url,created_at'"
);

// companies fields block
content = content.replace(
    /companies: 'id,project_id,user_id,name,sector,description,contact_name,contact_email,status,package_type,logo_url,tipo_interesse,areas_interesse,created_at,company_name,nome_representante'/g,
    "companies: 'id,project_id,user_id,name,sector,description,contact_name,contact_email,status,package_type,logo_url,tipo_interesse,areas_interesse,created_at,company_name,responsible_name'"
);

// startups fields block
content = content.replace(
    /startups: 'id,project_id,user_id,name,sector,stage,status,package_type,created_at,nome_startup,descricao_startup,nome_fundador,estagio'/g,
    "startups: 'id,project_id,user_id,name,sector,stage,status,package_type,created_at,company_name,description,responsible_name'"
);

// empresas_incentivadoras fields block
content = content.replace(
    /empresas_incentivadoras: 'id,project_id,nome_responsavel,email,telefone,company_name,quantidade_equipe,quantidade_dia,quantidade_noite,objetivo,status,valor_investido,created_at'/g,
    "empresas_incentivadoras: 'id,project_id,responsible_name,email,phone,company_name,quantidade_equipe,quantidade_dia,quantidade_noite,objetivo,status,paid_amount,created_at'"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated useData.ts queries!");
