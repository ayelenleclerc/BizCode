# Untitled object in HealthResponse Schema

```txt
undefined#/properties/db
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                       |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :----------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [HealthResponse.schema.json\*](../schema-json/HealthResponse.schema.json "open original schema") |

## db Type

`object` ([Details](healthresponse-properties-db.md))

# db Properties

| Property                | Type      | Required | Nullable       | Defined by                                                                                                             |
| :---------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------- |
| [latencyMs](#latencyms) | `number`  | Required | cannot be null | [HealthResponse](healthresponse-properties-db-properties-latencyms.md "undefined#/properties/db/properties/latencyMs") |
| [ok](#ok)               | `boolean` | Required | cannot be null | [HealthResponse](healthresponse-properties-db-properties-ok.md "undefined#/properties/db/properties/ok")               |

## latencyMs



`latencyMs`

* is required

* Type: `number`

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-db-properties-latencyms.md "undefined#/properties/db/properties/latencyMs")

### latencyMs Type

`number`

### latencyMs Constraints

**minimum**: the value of this number must greater than or equal to: `0`

## ok



`ok`

* is required

* Type: `boolean`

* cannot be null

* defined in: [HealthResponse](healthresponse-properties-db-properties-ok.md "undefined#/properties/db/properties/ok")

### ok Type

`boolean`
