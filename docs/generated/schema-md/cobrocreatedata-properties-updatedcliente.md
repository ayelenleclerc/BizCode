# Untitled object in CobroCreateData Schema

```txt
undefined#/properties/updatedCliente
```



| Abstract            | Extensible | Status         | Identifiable | Custom Properties | Additional Properties | Access Restrictions | Defined In                                                                                         |
| :------------------ | :--------- | :------------- | :----------- | :---------------- | :-------------------- | :------------------ | :------------------------------------------------------------------------------------------------- |
| Can be instantiated | No         | Unknown status | No           | Forbidden         | Allowed               | none                | [CobroCreateData.schema.json\*](../schema-json/CobroCreateData.schema.json "open original schema") |

## updatedCliente Type

`object` ([Details](cobrocreatedata-properties-updatedcliente.md))

# updatedCliente Properties

| Property                    | Type      | Required | Nullable       | Defined by                                                                                                                                           |
| :-------------------------- | :-------- | :------- | :------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| [balance](#balance)         | `number`  | Optional | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-balance.md "undefined#/properties/updatedCliente/properties/balance")         |
| [creditLimit](#creditlimit) | `number`  | Optional | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-creditlimit.md "undefined#/properties/updatedCliente/properties/creditLimit") |
| [id](#id)                   | `integer` | Required | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-id.md "undefined#/properties/updatedCliente/properties/id")                   |
| [rsocial](#rsocial)         | `string`  | Optional | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-rsocial.md "undefined#/properties/updatedCliente/properties/rsocial")         |
| [score](#score)             | `integer` | Required | cannot be null | [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-score.md "undefined#/properties/updatedCliente/properties/score")             |
| Additional Properties       | Any       | Optional | can be null    |                                                                                                                                                      |

## balance



`balance`

* is optional

* Type: `number`

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-balance.md "undefined#/properties/updatedCliente/properties/balance")

### balance Type

`number`

## creditLimit



`creditLimit`

* is optional

* Type: `number`

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-creditlimit.md "undefined#/properties/updatedCliente/properties/creditLimit")

### creditLimit Type

`number`

## id



`id`

* is required

* Type: `integer`

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-id.md "undefined#/properties/updatedCliente/properties/id")

### id Type

`integer`

## rsocial



`rsocial`

* is optional

* Type: `string`

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-rsocial.md "undefined#/properties/updatedCliente/properties/rsocial")

### rsocial Type

`string`

## score



`score`

* is required

* Type: `integer`

* cannot be null

* defined in: [CobroCreateData](cobrocreatedata-properties-updatedcliente-properties-score.md "undefined#/properties/updatedCliente/properties/score")

### score Type

`integer`

### score Constraints

**maximum**: the value of this number must smaller than or equal to: `100`

**minimum**: the value of this number must greater than or equal to: `0`

## Additional Properties

Additional properties are allowed and do not have to follow a specific schema
