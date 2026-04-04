const fs = require('fs');
const path = require('path');

const DIRECTORY = 'c:\\Users\\Cristiano D. Borges\\Downloads\\Plataforma Growth Summit 2026\\app\\src';

const replacements = [
    // Tables
    { from: /inscricoes_growth_experience/g, to: 'growth_experience_registrations' },
    { from: /inscricoes_empresas_incentivadoras/g, to: 'company_registrations' },
    { from: /mentores_growth_experience/g, to: 'growth_experience_mentors' },
    { from: /mentorias_agendadas/g, to: 'scheduled_mentorings' },
    { from: /lotes_inscricao_empresa/g, to: 'company_registration_batches' },
    { from: /cupons_parceria_social/g, to: 'social_partnership_coupons' },
    { from: /check_ins_atividades/g, to: 'activity_check_ins' },
    { from: /(?<!_)parceiros(?!_)/g, to: 'partners' }, // Only 'parceiros', not 'cupons_parceria_social'
    { from: /parceiros_equipe/g, to: 'partner_team' },
    { from: /programacao_evento/g, to: 'event_sessions' },
    { from: /startups_arena_pitch/g, to: 'startup_pitches' },
    { from: /rodada_negocios_b2b/g, to: 'b2b_registration' },
    { from: /transacoes_growth_experience/g, to: 'growth_experience_transactions' },
    { from: /inscricoes_sorteio/g, to: 'raffle_registrations' },

    // Columns
    { from: /status_pagamento/g, to: 'payment_status' },
    { from: /tipo_inscricao/g, to: 'registration_type' },
    { from: /valor_pago/g, to: 'paid_amount' },
    { from: /nome_empresa/g, to: 'company_name' },
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
            if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.cjs')) {
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

console.log("Files updated:");
changedFiles.forEach(f => console.log(f));
