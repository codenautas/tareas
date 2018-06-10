set search_path = tar;

select setseed(0.123456789);

alter table objetivos add column max_tar integer;

insert into objetivos (objetivo,descripcion, max_tar) 
  select 'OBJ '||num, 
         case round(random()::decimal*7,0) 
           when 1 then 'Hacer'
           when 2 then 'Controlar'
           when 3 then 'Verificar'
           when 4 then 'Obtener'
           when 5 then 'Suministrar'
           when 6 then 'Revisar'
           else 'Realizar'
         end || ' ' || case round(random()::decimal*8,0) 
           when 1 then 'el procedimiento'
           when 2 then 'la serie de taeras'
           when 3 then 'el plan'
           when 4 then 'la lista'
           when 5 then 'la planificación'
           when 6 then 'la secuencia'
           else 'el objetivo'
         end || ' ' || case round(random()::decimal*9,0) 
           when 1 then 'número '||num
           when 2 then 'N '||num
           when 3 then '#'||num
           when 4 then to_char(num,'RM')
           when 5 then 'N° '||num
           else num::text
         end, round(random()*case when random()<0.3 then 6 else 100 end )::decimal
    from generate_series(1,90) num;

insert into tareas (objetivo, tarea, descripcion, avance)
  select objetivo, objetivo||'-'||num,
         case round(random()::decimal*7,0) 
           when 1 then 'Hacer'
           when 2 then 'Controlar'
           when 3 then 'Verificar'
           when 4 then 'Obtener'
           when 5 then 'Suministrar'
           when 6 then 'Revisar'
           else 'Realizar'
         end || ' ' || case round(random()::decimal*8,0) 
           when 1 then 'el procedimiento'
           when 2 then 'el ítem'
           when 3 then 'el punto'
           when 4 then 'el ítem'
           else 'la tarea'
         end || ' ' || case round(random()::decimal*12,0) 
           when 1 then 'número '||num
           when 2 then 'N '||num
           when 3 then '#'||num
           when 4 then to_char(num,'RN')
           when 5 then 'N° '||num
           else num::text
         end || case round(random()::decimal*6,0) 
           when 1 then '/'||objetivo
           else ''
         end,
         case when random()<0.25 then null
              when random()<0.50 then round(random()::decimal*100,2)
              else 100
         end
    from objetivos, lateral (select * from generate_series(1,max_tar) num) n;