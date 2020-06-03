# Usage example
See [this sync example](./SYNC-EXAMPLE.md).

# Api
## Document

**Extends**: <code>EventEmitter</code>  
**Emits**: [<code>update</code>](#Document+event_update)  

* [Document](#Document) ⇐ <code>EventEmitter</code>
    * [new Document(id, doc)](#new_Document_new)
    * _instance_
        * [.id](#Document+id) : <code>string</code>
        * [.doc](#Document+doc) : <code>Y.Doc</code>
        * [.content](#Document+content) : [<code>DocumentContent</code>](#DocumentContent)
        * [.versions](#Document+versions) : [<code>DocumentVersions</code>](#DocumentVersions)
        * [.docState](#Document+docState) : <code>Uint8Array</code>
        * [.doc](#Document+doc)
        * [.init()](#Document+init)
        * [.destroy()](#Document+destroy)
        * [.clone()](#Document+clone) ⇒ [<code>Document</code>](#Document)
        * [.applyUpdate(update, origin)](#Document+applyUpdate)
        * [.updateDiff(otherDoc)](#Document+updateDiff) ⇒ <code>Uint8Array</code>
        * [.equals(otherDocument)](#Document+equals)
        * [.transact(fn, origin)](#Document+transact)
        * ["update" (data, documentContent)](#Document+event_update)
        * ["update" (data, document)](#Document+event_update)
    * _static_
        * [.encode(document)](#Document.encode) ⇒ <code>Uint8Array</code>
        * [.decode(encodedDocument)](#Document.decode) ⇒ [<code>Document</code>](#Document)


<br><a name="new_Document_new"></a>

### new Document(id, doc)
> Creates a new Document.


| Param | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | document id |
| doc | <code>Y.Doc</code> | document doc instance |


<br><a name="Document+id"></a>

### document.id : <code>string</code>
> Document id.


<br><a name="Document+doc"></a>

### document.doc : <code>Y.Doc</code>
> YJS Doc instance.


<br><a name="Document+content"></a>

### document.content : [<code>DocumentContent</code>](#DocumentContent)
> Content representation.


<br><a name="Document+versions"></a>

### document.versions : [<code>DocumentVersions</code>](#DocumentVersions)
> Versions for this document.


<br><a name="Document+docState"></a>

### document.docState : <code>Uint8Array</code>
> `document.doc` encoded as YJS update.


<br><a name="Document+doc"></a>

### document.doc
> Sets YJS document


| Param | Type | Description |
| --- | --- | --- |
| doc | <code>Y.Doc</code> | YJS document |


<br><a name="Document+init"></a>

### document.init()
> Initialize current doc. On events.


<br><a name="Document+destroy"></a>

### document.destroy()
> Destroy current doc. Off events.


<br><a name="Document+clone"></a>

### document.clone() ⇒ [<code>Document</code>](#Document)
> Clone this document and return a new one.


<br><a name="Document+applyUpdate"></a>

### document.applyUpdate(update, origin)

| Param | Type |
| --- | --- |
| update | <code>Uint8Array</code> | 
| origin | <code>any</code> | 


<br><a name="Document+updateDiff"></a>

### document.updateDiff(otherDoc) ⇒ <code>Uint8Array</code>
> Computes differences between doc states and return diff as update.

**Returns**: <code>Uint8Array</code> - diff update.  

| Param | Type | Description |
| --- | --- | --- |
| otherDoc | [<code>Document</code>](#Document) | Document to compare. |


<br><a name="Document+equals"></a>

### document.equals(otherDocument)

| Param | Type |
| --- | --- |
| otherDocument | [<code>Document</code>](#Document) | 


<br><a name="Document+transact"></a>

### document.transact(fn, origin)
> Creates a transaction in wich the function `fn` will be executed


| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to execute in a transaction |
| origin | <code>any</code> | Origin for this transaction |


<br><a name="Document+event_update"></a>

### "update" (data, documentContent)

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> |  |
| data.events | <code>Array.&lt;Y.Event&gt;</code> | list of events for this update. |
| data.transaction | <code>Y.Transaction</code> | transaction for this update. |
| documentContent | [<code>DocumentContent</code>](#DocumentContent) | DocumentContent updated. |


<br><a name="Document+event_update"></a>

### "update" (data, document)

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> |  |
| data.update | <code>Uint8Array</code> | Update applied. |
| data.origin | <code>any</code> | Origin for this update. |
| document | [<code>Document</code>](#Document) | Document updated. |


<br><a name="Document.encode"></a>

### Document.encode(document) ⇒ <code>Uint8Array</code>
> Encode a Document instance.

**Returns**: <code>Uint8Array</code> - encoded document  

| Param | Type |
| --- | --- |
| document | [<code>Document</code>](#Document) | 


<br><a name="Document.decode"></a>

### Document.decode(encodedDocument) ⇒ [<code>Document</code>](#Document)
> Decodes an encoded Document instance.

**Returns**: [<code>Document</code>](#Document) - document  

| Param | Type |
| --- | --- |
| encodedDocument | <code>Uint8Array</code> | 


## DocumentContent

> DocumentContent class for content

**Extends**: <code>EventEmitter</code>  
**Emits**: <code>DocumentContent#event:update</code>  

* [DocumentContent](#DocumentContent) ⇐ <code>EventEmitter</code>
    * [new DocumentContent(document)](#new_DocumentContent_new)
    * [.document](#DocumentContent+document) : [<code>Document</code>](#Document)
    * [.xmlFragment](#DocumentContent+xmlFragment) : <code>Y.XmlFragment</code>
    * [.length](#DocumentContent+length) : <code>number</code>
    * [.init()](#DocumentContent+init)
    * [.destroy()](#DocumentContent+destroy)
    * [.equals(otherContent)](#DocumentContent+equals) ⇒ <code>boolean</code>
    * [.insert(index, content, [origin])](#DocumentContent+insert)
    * [.delete(index, [length], [origin])](#DocumentContent+delete)
    * [.toString()](#DocumentContent+toString) ⇒ <code>string</code>
    * [.fromMarkdown(markdown)](#DocumentContent+fromMarkdown) ⇒ [<code>Document</code>](#Document)
    * [.toMarkdown()](#DocumentContent+toMarkdown) ⇒ <code>string</code>
    * [.toHtml()](#DocumentContent+toHtml) ⇒ <code>string</code>


<br><a name="new_DocumentContent_new"></a>

### new DocumentContent(document)
> Creates a DocumentContent for a Document instance.


| Param | Type | Description |
| --- | --- | --- |
| document | [<code>Document</code>](#Document) | document for this content |


<br><a name="DocumentContent+document"></a>

### documentContent.document : [<code>Document</code>](#Document)
> Document for this content.


<br><a name="DocumentContent+xmlFragment"></a>

### documentContent.xmlFragment : <code>Y.XmlFragment</code>
> Y.XmlFragment content


<br><a name="DocumentContent+length"></a>

### documentContent.length : <code>number</code>
> Content length.


<br><a name="DocumentContent+init"></a>

### documentContent.init()
> Initialize content. On events.


<br><a name="DocumentContent+destroy"></a>

### documentContent.destroy()
> Destroy current content. Off events.


<br><a name="DocumentContent+equals"></a>

### documentContent.equals(otherContent) ⇒ <code>boolean</code>
> Compares two DocumentContent instances.

**Returns**: <code>boolean</code> - same  

| Param | Type |
| --- | --- |
| otherContent | [<code>DocumentContent</code>](#DocumentContent) | 


<br><a name="DocumentContent+insert"></a>

### documentContent.insert(index, content, [origin])
> Inserts new content at an index.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>number</code> |  | The index to insert content at |
| content | <code>Array.&lt;(YXmlElement\|YXmlText)&gt;</code> |  | The array of content |
| [origin] | <code>object</code> | <code>{}</code> | Origin extra data for transaction |


<br><a name="DocumentContent+delete"></a>

### documentContent.delete(index, [length], [origin])
> Deletes elements starting from an index.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>number</code> |  | Index at which to start deleting elements |
| [length] | <code>number</code> | <code>1</code> | The number of elements to remove. Defaults to 1 |
| [origin] | <code>object</code> | <code>{}</code> | Origin extra data for transaction |


<br><a name="DocumentContent+toString"></a>

### documentContent.toString() ⇒ <code>string</code>
> Get the string representation of this content.

**Returns**: <code>string</code> - The string representation of this content.  

<br><a name="DocumentContent+fromMarkdown"></a>

### documentContent.fromMarkdown(markdown) ⇒ [<code>Document</code>](#Document)
> Set current content based on `markdown`. Current content will be replaced.

**Returns**: [<code>Document</code>](#Document) - document  

| Param | Type |
| --- | --- |
| markdown | <code>string</code> | 


<br><a name="DocumentContent+toMarkdown"></a>

### documentContent.toMarkdown() ⇒ <code>string</code>
> Markdown representation of this content.

**Returns**: <code>string</code> - Content as Markdown  

<br><a name="DocumentContent+toHtml"></a>

### documentContent.toHtml() ⇒ <code>string</code>
> HTML representation of this content.

**Returns**: <code>string</code> - Content as HTML  

## DocumentVersions

> DocumentVersions class for document


* [DocumentVersions](#DocumentVersions)
    * [.document](#DocumentVersions+document) : [<code>Document</code>](#Document)
    * [.versions](#DocumentVersions+versions) : <code>Object.&lt;string, version&gt;</code>
    * [.currentVersionId](#DocumentVersions+currentVersionId) : <code>string</code>
    * [.current](#DocumentVersions+current) : [<code>version</code>](#version)
    * [.count](#DocumentVersions+count) : <code>number</code>
    * [.currentVersionId](#DocumentVersions+currentVersionId)
    * [.init()](#DocumentVersions+init)
    * [.destroy()](#DocumentVersions+destroy)
    * [.create(name, [origin])](#DocumentVersions+create) ⇒ [<code>version</code>](#version)
    * [.restore(versionId, [origin])](#DocumentVersions+restore) ⇒ [<code>version</code>](#version)


<br><a name="DocumentVersions+document"></a>

### documentVersions.document : [<code>Document</code>](#Document)
> Document for this content.


<br><a name="DocumentVersions+versions"></a>

### documentVersions.versions : <code>Object.&lt;string, version&gt;</code>
> Available versions.


<br><a name="DocumentVersions+currentVersionId"></a>

### documentVersions.currentVersionId : <code>string</code>
> Current version id for `documentVersions.document`.


<br><a name="DocumentVersions+current"></a>

### documentVersions.current : [<code>version</code>](#version)
> Current version for document.


<br><a name="DocumentVersions+count"></a>

### documentVersions.count : <code>number</code>
> Versions count.


<br><a name="DocumentVersions+currentVersionId"></a>

### documentVersions.currentVersionId
> Sets current version id.


| Param | Type | Description |
| --- | --- | --- |
| currentVersionId | <code>string</code> | id for current version. |


<br><a name="DocumentVersions+init"></a>

### documentVersions.init()
> Initialize versions. On events.


<br><a name="DocumentVersions+destroy"></a>

### documentVersions.destroy()
> Destroy current versions. Off events.


<br><a name="DocumentVersions+create"></a>

### documentVersions.create(name, [origin]) ⇒ [<code>version</code>](#version)
> Creates and sets a new version as current. Current version will be freezed.

**Returns**: [<code>version</code>](#version) - Created and current version.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | Name for new version. |
| [origin] | <code>object</code> | <code>{}</code> | Origin extra data for transaction |


<br><a name="DocumentVersions+restore"></a>

### documentVersions.restore(versionId, [origin]) ⇒ [<code>version</code>](#version)
> Restore `#documentVersions.document` to a previous version.

**Returns**: [<code>version</code>](#version) - Restored version data.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| versionId | <code>string</code> |  | desired id version to restore. |
| [origin] | <code>object</code> | <code>{}</code> | Origin extra data for transaction |

