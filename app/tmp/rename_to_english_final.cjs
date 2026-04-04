const fs = require('fs');
const path = require('path');

const DIRECTORY = 'c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\src';

const replacements = [
    // Tables (from portuguese)
    { from: /check_ins_atividades/g, to: 'activity_check_ins' },
    { from: /cupons_parceria_social/g, to: 'social_partnership_coupons' },
    { from: /inscricoes_empresas_incentivadoras/g, to: 'incentive_company_registrations' },
    { from: /lotes_inscricao_empresa/g, to: 'company_registration_batches' },
    { from: /mentores_growth_experience/g, to: 'growth_experience_mentors' },
    { from: /mentorias_agendadas/g, to: 'scheduled_mentorings' },
    { from: /(?<!_)parceiros(?!_)/g, to: 'partners' },
    { from: /parceiros_equipe/g, to: 'partner_team_members' },
    { from: /programacao_evento/g, to: 'event_schedule' },
    { from: /rodada_negocios_b2b/g, to: 'b2b_business_rounds' },
    { from: /startups_arena_pitch/g, to: 'arena_pitch_startups' },
    { from: /transacoes_growth_experience/g, to: 'growth_experience_transactions' },
    
    // Tables (from my intermediate English)
    { from: /company_registrations/g, to: 'incentive_company_registrations' },
    { from: /partner_team/g, to: 'partner_team_members' },
    { from: /event_sessions/g, to: 'event_schedule' },
    { from: /b2b_registration/g, to: 'b2b_business_rounds' },
    { from: /startup_pitches/g, to: 'arena_pitch_startups' },

    // General columns exact match properties (safeguard against replacing generic wording in UI text)
    // We use word boundaries \b to only replace property names
    { from: /\bcursos_selecionados\b/g, to: 'selected_courses' },
    { from: /\bstatus_pagamento\b/g, to: 'payment_status' },
    { from: /\bpalestras_noturnas\b/g, to: 'night_lectures' },
    { from: /\bcupom_palestra\b/g, to: 'lecture_coupon' },
    { from: /\btipo_atividade_selecionada\b/g, to: 'selected_activity_type' },
    { from: /\bsala_atividade\b/g, to: 'activity_room' },
    { from: /\bhorario_atividade\b/g, to: 'activity_schedule' },
    { from: /\bindicacao_tipo\b/g, to: 'referral_type' },
    { from: /\bindicacao_nome\b/g, to: 'referral_name' },
    { from: /\bcodigo_social\b/g, to: 'social_code' },
    { from: /\bcodigo_palestra\b/g, to: 'lecture_code' },
    { from: /\bnivel_atividade\b/g, to: 'activity_level' },
    { from: /\bvalor_desconto_palestra\b/g, to: 'lecture_discount_amount' },

    // social_partnership_coupons
    { from: /\bporcentagem_desconto\b/g, to: 'discount_percentage' },
    { from: /\buso_limite\b/g, to: 'usage_limit' },
    { from: /\buso_atual\b/g, to: 'current_usage' },
    { from: /\bvencimento\b/g, to: 'expires_at' },

    // incentive_company_registrations
    { from: /\bnome_responsavel\b/g, to: 'responsible_name' },
    { from: /\bquantidade_equipe\b/g, to: 'team_quantity' },
    { from: /\bquantidade_dia\b/g, to: 'day_quantity' },
    { from: /\bquantidade_noite\b/g, to: 'night_quantity' },
    { from: /\bvalor_investido\b/g, to: 'invested_amount' },
    
    // company_registration_batches
    { from: /\bemail_contato\b/g, to: 'contact_email' },
    { from: /\bemail_responsavel\b/g, to: 'responsible_email' },
    { from: /\bquantidade_vagas\b/g, to: 'total_slots' },
    { from: /\bvagas_utilizadas\b/g, to: 'used_slots' },
    { from: /\bvalor_total\b/g, to: 'total_amount' },
    { from: /\bobservacoes\b/g, to: 'notes' },

    // growth_experience_mentors
    { from: /\bespecialidades\b/g, to: 'specialties' },
    { from: /\bfoto_url\b/g, to: 'photo_url' },
    { from: /\bmax_mentories\b/g, to: 'max_mentorings' },

    // scheduled_mentorings
    { from: /\bmentorado_id\b/g, to: 'mentee_id' },
    { from: /\bnome_mentorado\b/g, to: 'mentee_name' },
    { from: /\bemail_mentorado\b/g, to: 'mentee_email' },
    { from: /\btelefone_mentorado\b/g, to: 'mentee_phone' },
    { from: /\btema_interesse\b/g, to: 'topic_of_interest' },
    { from: /\banotacoes\b/g, to: 'notes' },
    { from: /\bdata_mentoria\b/g, to: 'mentoring_date' },
    { from: /\bavaliacao_mentoria\b/g, to: 'mentoring_rating' },
    { from: /\bindicacao_mentor\b/g, to: 'mentor_recommendation' },
    { from: /\bavaliado_em\b/g, to: 'evaluated_at' },

    // event_schedule
    { from: /\bmax_vagas\b/g, to: 'max_slots' },

    // b2b_business_rounds
    { from: /\bnome_representante\b/g, to: 'representative_name' },
    { from: /\btipo_interesse\b/g, to: 'interest_type' },
    { from: /\bareas_interesse\b/g, to: 'interest_areas' },
    { from: /\bdescricao_objetivos\b/g, to: 'objectives_description' },

    // arena_pitch_startups
    { from: /\bnome_startup\b/g, to: 'startup_name' },
    { from: /\bnome_fundador\b/g, to: 'founder_name' },
    { from: /\bdescricao_startup\b/g, to: 'startup_description' },

    // support_tickets
    { from: /\bnotificado_via_whatsapp\b/g, to: 'whatsapp_notified' },

    // High risk fields (nome, email, telefone, cargo, empresa, etc)
    // We only replace these if they strictly look like object properties (e.g., .cargo, cargo: )
    { from: /\bcargo(?=: )/g, to: 'role_title' },
    { from: /\.cargo\b/g, to: '.role_title' },
    { from: /\bnome_empresa(?=: )/g, to: 'company_name' },
    { from: /\.nome_empresa\b/g, to: '.company_name' },
    { from: /\btelefone(?=: )/g, to: 'phone' },
    { from: /\.telefone\b/g, to: '.phone' },
    { from: /\bcargo\b(?=\s*\?\s*:)/g, to: 'role_title' }, // cargo?:
    { from: /\btelefone\b(?=\s*\?\s*:)/g, to: 'phone' },   // telefone?:
    { from: /\bnome_empresa\b(?=\s*\?\s*:)/g, to: 'company_name' },
];

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(fullPath));
        } else {
            if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const files = walkDir(DIRECTORY);
let changedFiles = [];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles.push(file);
    }
});

console.log("Files updated with final mapping:");
changedFiles.forEach(f => console.log(f));
