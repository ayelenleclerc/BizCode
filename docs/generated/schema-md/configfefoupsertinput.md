# ConfigFefoUpsertInput Schema

```txt
undefined
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                                   |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [ConfigFefoUpsertInput.schema.json](../schema-json/ConfigFefoUpsertInput.schema.json "open original schema") |

## ConfigFefoUpsertInput Type

`object` ([ConfigFefoUpsertInput](configfefoupsertinput.md))

# ConfigFefoUpsertInput Properties

| Property                                        | Type      | Required | Nullable       | Defined by                                                                                                                       |
| :---------------------------------------------- | :-------- | :------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| [diasAlertaVencimiento](#diasalertavencimiento) | `integer` | Required | cannot be null | [ConfigFefoUpsertInput](configfefoupsertinput-properties-diasalertavencimiento.md "undefined#/properties/diasAlertaVencimiento") |

## diasAlertaVencimiento



`diasAlertaVencimiento`

* is required

* Type: `integer`

* cannot be null

* defined in: [ConfigFefoUpsertInput](configfefoupsertinput-properties-diasalertavencimiento.md "undefined#/properties/diasAlertaVencimiento")

### diasAlertaVencimiento Type

`integer`

### diasAlertaVencimiento Constraints

**maximum**: the value of this number must smaller than or equal to: `365`

**minimum**: the value of this number must greater than or equal to: `1`
