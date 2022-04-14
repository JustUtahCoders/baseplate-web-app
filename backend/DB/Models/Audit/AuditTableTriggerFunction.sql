CREATE OR REPLACE FUNCTION "MODELNAME_audit_trigger_func"()
RETURNS trigger AS $body$
DECLARE
  arg_user_id INT;
BEGIN
  arg_user_id := TG_ARGV[0];

  if (TG_OP = 'INSERT') then
    INSERT INTO "MODELNAMEAudit" (
      "auditUserId",
      "auditItemId",
      "auditEventType",
      "auditTimestamp",
      "oldRowData",
      "newRowData"
    )
    VALUES
    (
      NEW."auditUserId",
      NEW.id,
      'INSERT',
      CURRENT_TIMESTAMP,
      null,
      to_jsonb(NEW)
    );
          
    RETURN NEW;
  end if;

  if (TG_OP = 'UPDATE') then
    INSERT INTO "MODELNAMEAudit" (
      "auditUserId",
      "auditItemId",
      "auditEventType",
      "auditTimestamp",
      "oldRowData",
      "newRowData"
    )
    VALUES
    (
      NEW."auditUserId",
      NEW.id,
      'UPDATE',
      CURRENT_TIMESTAMP,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
          
    RETURN NEW;
  end if;

  if (TG_OP = 'DELETE') then
    INSERT INTO "MODELNAMEAudit" (
      "auditUserId",
      "auditItemId",
      "auditEventType",
      "auditTimestamp",
      "oldRowData",
      "newRowData"
    )
    VALUES
    (
      NULL,
      NULL,
      'DELETE',
      CURRENT_TIMESTAMP,
      to_jsonb(OLD),
      NULL
    );
          
    RETURN NEW;
  end if;

END;
$body$
LANGUAGE plpgsql
