&emsp;&emsp;<a name="TypeParameters"></a>*TypeParameters* **:**  
&emsp;&emsp;&emsp;<a name="TypeParameters-27ce0641"></a>`` < ``&emsp;*[TypeParameterList](#TypeParameterList)*&emsp;`` > ``  
  
&emsp;&emsp;<a name="TypeParameterList"></a>*TypeParameterList* **:**  
&emsp;&emsp;&emsp;<a name="TypeParameterList-49b4855e"></a>*[TypeParameter](#TypeParameter)*  
&emsp;&emsp;&emsp;<a name="TypeParameterList-89045ccd"></a>*[TypeParameterList](#TypeParameterList)*&emsp;`` , ``&emsp;*[TypeParameter](#TypeParameter)*  
  
&emsp;&emsp;<a name="TypeParameter"></a>*TypeParameter* **:**  
&emsp;&emsp;&emsp;<a name="TypeParameter-94e4958a"></a>*[Identifier](#Identifier)*&emsp;*[Constraint](#Constraint)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="Constraint"></a>*Constraint* **:**  
&emsp;&emsp;&emsp;<a name="Constraint-f5cc0152"></a>`` extends ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="TypeArguments"></a>*TypeArguments* **:**  
&emsp;&emsp;&emsp;<a name="TypeArguments-8f8c81b6"></a>`` < ``&emsp;*[TypeArgumentList](#TypeArgumentList)*&emsp;`` > ``  
  
&emsp;&emsp;<a name="TypeArgumentList"></a>*TypeArgumentList* **:**  
&emsp;&emsp;&emsp;<a name="TypeArgumentList-f89ea15f"></a>*[TypeArgument](#TypeArgument)*  
&emsp;&emsp;&emsp;<a name="TypeArgumentList-6ad31614"></a>*[TypeArgumentList](#TypeArgumentList)*&emsp;`` , ``&emsp;*[TypeArgument](#TypeArgument)*  
  
&emsp;&emsp;<a name="TypeArgument"></a>*TypeArgument* **:**  
&emsp;&emsp;&emsp;<a name="TypeArgument-3deb7456"></a>*[Type](#Type)*  
  
&emsp;&emsp;<a name="Type"></a>*Type* **:**  
&emsp;&emsp;&emsp;<a name="Type-257564ec"></a>*[PrimaryOrUnionType](#PrimaryOrUnionType)*  
&emsp;&emsp;&emsp;<a name="Type-e94e83ec"></a>*[FunctionType](#FunctionType)*  
&emsp;&emsp;&emsp;<a name="Type-a468d46c"></a>*[ConstructorType](#ConstructorType)*  
  
&emsp;&emsp;<a name="PrimaryOrUnionType"></a>*PrimaryOrUnionType* **:**  
&emsp;&emsp;&emsp;<a name="PrimaryOrUnionType-9713b445"></a>*[PrimaryType](#PrimaryType)*  
&emsp;&emsp;&emsp;<a name="PrimaryOrUnionType-2cfef1bf"></a>*[UnionType](#UnionType)*  
  
&emsp;&emsp;<a name="PrimaryType"></a>*PrimaryType* **:**  
&emsp;&emsp;&emsp;<a name="PrimaryType-ea3ff2ed"></a>*[ParenthesizedType](#ParenthesizedType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-aeee8ad9"></a>*[PredefinedType](#PredefinedType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-74e8bc50"></a>*[TypeReference](#TypeReference)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-34f1b931"></a>*[ObjectType](#ObjectType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-77e0a11a"></a>*[ArrayType](#ArrayType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-afea73f1"></a>*[TupleType](#TupleType)*  
&emsp;&emsp;&emsp;<a name="PrimaryType-924031c9"></a>*[TypeQuery](#TypeQuery)*  
  
&emsp;&emsp;<a name="ParenthesizedType"></a>*ParenthesizedType* **:**  
&emsp;&emsp;&emsp;<a name="ParenthesizedType-1ac8fd41"></a>`` ( ``&emsp;*[Type](#Type)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="PredefinedType"></a>*PredefinedType* **:**  
&emsp;&emsp;&emsp;<a name="PredefinedType-8ca7f9b0"></a>`` any ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-cf8fbef8"></a>`` number ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-5e82704d"></a>`` boolean ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-f5c10ab3"></a>`` string ``  
&emsp;&emsp;&emsp;<a name="PredefinedType-94b80d2f"></a>`` void ``  
  
&emsp;&emsp;<a name="TypeReference"></a>*TypeReference* **:**  
&emsp;&emsp;&emsp;<a name="TypeReference-8035819d"></a>*[TypeName](#TypeName)*&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;*[TypeArguments](#TypeArguments)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TypeName"></a>*TypeName* **:**  
&emsp;&emsp;&emsp;<a name="TypeName-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="TypeName-5a7de153"></a>*[ModuleName](#ModuleName)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ModuleName"></a>*ModuleName* **:**  
&emsp;&emsp;&emsp;<a name="ModuleName-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="ModuleName-5a7de153"></a>*[ModuleName](#ModuleName)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ObjectType"></a>*ObjectType* **:**  
&emsp;&emsp;&emsp;<a name="ObjectType-a7a8ac82"></a>`` { ``&emsp;*[TypeBody](#TypeBody)*<sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="TypeBody"></a>*TypeBody* **:**  
&emsp;&emsp;&emsp;<a name="TypeBody-bc262b5a"></a>*[TypeMemberList](#TypeMemberList)*&emsp;`` ; ``<sub>opt</sub>  
  
&emsp;&emsp;<a name="TypeMemberList"></a>*TypeMemberList* **:**  
&emsp;&emsp;&emsp;<a name="TypeMemberList-4e9429c1"></a>*[TypeMember](#TypeMember)*  
&emsp;&emsp;&emsp;<a name="TypeMemberList-1e7cb02e"></a>*[TypeMemberList](#TypeMemberList)*&emsp;`` ; ``&emsp;*[TypeMember](#TypeMember)*  
  
&emsp;&emsp;<a name="TypeMember"></a>*TypeMember* **:**  
&emsp;&emsp;&emsp;<a name="TypeMember-89003b98"></a>*[PropertySignature](#PropertySignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-c1501895"></a>*[CallSignature](#CallSignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-56fc3592"></a>*[ConstructSignature](#ConstructSignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-0dd6b549"></a>*[IndexSignature](#IndexSignature)*  
&emsp;&emsp;&emsp;<a name="TypeMember-52cd7cd6"></a>*[MethodSignature](#MethodSignature)*  
  
&emsp;&emsp;<a name="ArrayType"></a>*ArrayType* **:**  
&emsp;&emsp;&emsp;<a name="ArrayType-3cec7106"></a>*[PrimaryType](#PrimaryType)*&emsp;[no *[LineTerminator](#LineTerminator)* here]&emsp;`` [ ``&emsp;`` ] ``  
  
&emsp;&emsp;<a name="TupleType"></a>*TupleType* **:**  
&emsp;&emsp;&emsp;<a name="TupleType-5173d7d7"></a>`` [ ``&emsp;*[TupleElementTypes](#TupleElementTypes)*&emsp;`` ] ``  
  
&emsp;&emsp;<a name="TupleElementTypes"></a>*TupleElementTypes* **:**  
&emsp;&emsp;&emsp;<a name="TupleElementTypes-eda6874c"></a>*[TupleElementType](#TupleElementType)*  
&emsp;&emsp;&emsp;<a name="TupleElementTypes-6bd6800d"></a>*[TupleElementTypes](#TupleElementTypes)*&emsp;`` , ``&emsp;*[TupleElementType](#TupleElementType)*  
  
&emsp;&emsp;<a name="TupleElementType"></a>*TupleElementType* **:**  
&emsp;&emsp;&emsp;<a name="TupleElementType-3deb7456"></a>*[Type](#Type)*  
  
&emsp;&emsp;<a name="UnionType"></a>*UnionType* **:**  
&emsp;&emsp;&emsp;<a name="UnionType-93d8bd25"></a>*[PrimaryOrUnionType](#PrimaryOrUnionType)*&emsp;`` | ``&emsp;*[PrimaryType](#PrimaryType)*  
  
&emsp;&emsp;<a name="FunctionType"></a>*FunctionType* **:**  
&emsp;&emsp;&emsp;<a name="FunctionType-8f7a82e7"></a>*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` => ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="ConstructorType"></a>*ConstructorType* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorType-4490a1b4"></a>`` new ``&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` => ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="TypeQuery"></a>*TypeQuery* **:**  
&emsp;&emsp;&emsp;<a name="TypeQuery-7fdc10c8"></a>`` typeof ``&emsp;*[TypeQueryExpression](#TypeQueryExpression)*  
  
&emsp;&emsp;<a name="TypeQueryExpression"></a>*TypeQueryExpression* **:**  
&emsp;&emsp;&emsp;<a name="TypeQueryExpression-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="TypeQueryExpression-74ca3afb"></a>*[TypeQueryExpression](#TypeQueryExpression)*&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
  
&emsp;&emsp;<a name="PropertySignature"></a>*PropertySignature* **:**  
&emsp;&emsp;&emsp;<a name="PropertySignature-45625f88"></a>*[PropertyName](#PropertyName)*&emsp;`` ? ``<sub>opt</sub>&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="PropertyName"></a>*PropertyName* **:**  
&emsp;&emsp;&emsp;<a name="PropertyName-0ebb31e2"></a>*[IdentifierName](#IdentifierName)*  
&emsp;&emsp;&emsp;<a name="PropertyName-5c74e54d"></a>*[StringLiteral](#StringLiteral)*  
&emsp;&emsp;&emsp;<a name="PropertyName-a548b407"></a>*[NumericLiteral](#NumericLiteral)*  
  
&emsp;&emsp;<a name="CallSignature"></a>*CallSignature* **:**  
&emsp;&emsp;&emsp;<a name="CallSignature-480c0935"></a>*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ParameterList"></a>*ParameterList* **:**  
&emsp;&emsp;&emsp;<a name="ParameterList-bf71dbf2"></a>*[RequiredParameterList](#RequiredParameterList)*  
&emsp;&emsp;&emsp;<a name="ParameterList-9c07b35b"></a>*[OptionalParameterList](#OptionalParameterList)*  
&emsp;&emsp;&emsp;<a name="ParameterList-8334dabd"></a>*[RestParameter](#RestParameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-c5f488db"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[OptionalParameterList](#OptionalParameterList)*  
&emsp;&emsp;&emsp;<a name="ParameterList-cea83933"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[RestParameter](#RestParameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-7ecbaedf"></a>*[OptionalParameterList](#OptionalParameterList)*&emsp;`` , ``&emsp;*[RestParameter](#RestParameter)*  
&emsp;&emsp;&emsp;<a name="ParameterList-7d876e16"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[OptionalParameterList](#OptionalParameterList)*&emsp;`` , ``&emsp;*[RestParameter](#RestParameter)*  
  
&emsp;&emsp;<a name="RequiredParameterList"></a>*RequiredParameterList* **:**  
&emsp;&emsp;&emsp;<a name="RequiredParameterList-cb233da7"></a>*[RequiredParameter](#RequiredParameter)*  
&emsp;&emsp;&emsp;<a name="RequiredParameterList-fc994f02"></a>*[RequiredParameterList](#RequiredParameterList)*&emsp;`` , ``&emsp;*[RequiredParameter](#RequiredParameter)*  
  
&emsp;&emsp;<a name="RequiredParameter"></a>*RequiredParameter* **:**  
&emsp;&emsp;&emsp;<a name="RequiredParameter-6b890662"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="RequiredParameter-e691ee59"></a>*[Identifier](#Identifier)*&emsp;`` : ``&emsp;*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="AccessibilityModifier"></a>*AccessibilityModifier* **:**  
&emsp;&emsp;&emsp;<a name="AccessibilityModifier-212f55e2"></a>`` public ``  
&emsp;&emsp;&emsp;<a name="AccessibilityModifier-af3e0d5c"></a>`` private ``  
&emsp;&emsp;&emsp;<a name="AccessibilityModifier-c1d398df"></a>`` protected ``  
  
&emsp;&emsp;<a name="OptionalParameterList"></a>*OptionalParameterList* **:**  
&emsp;&emsp;&emsp;<a name="OptionalParameterList-12543786"></a>*[OptionalParameter](#OptionalParameter)*  
&emsp;&emsp;&emsp;<a name="OptionalParameterList-2e0ba35a"></a>*[OptionalParameterList](#OptionalParameterList)*&emsp;`` , ``&emsp;*[OptionalParameter](#OptionalParameter)*  
  
&emsp;&emsp;<a name="OptionalParameter"></a>*OptionalParameter* **:**  
&emsp;&emsp;&emsp;<a name="OptionalParameter-f505d701"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;*[Identifier](#Identifier)*&emsp;`` ? ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="OptionalParameter-370e9f41"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*  
&emsp;&emsp;&emsp;<a name="OptionalParameter-94975a30"></a>*[Identifier](#Identifier)*&emsp;`` ? ``&emsp;`` : ``&emsp;*[StringLiteral](#StringLiteral)*  
  
&emsp;&emsp;<a name="RestParameter"></a>*RestParameter* **:**  
&emsp;&emsp;&emsp;<a name="RestParameter-40daecaf"></a>`` ... ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ConstructSignature"></a>*ConstructSignature* **:**  
&emsp;&emsp;&emsp;<a name="ConstructSignature-cf9fd631"></a>`` new ``&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="IndexSignature"></a>*IndexSignature* **:**  
&emsp;&emsp;&emsp;<a name="IndexSignature-a7214a14"></a>`` [ ``&emsp;*[Identifier](#Identifier)*&emsp;`` : ``&emsp;`` string ``&emsp;`` ] ``&emsp;*[TypeAnnotation](#TypeAnnotation)*  
&emsp;&emsp;&emsp;<a name="IndexSignature-b128da0b"></a>`` [ ``&emsp;*[Identifier](#Identifier)*&emsp;`` : ``&emsp;`` number ``&emsp;`` ] ``&emsp;*[TypeAnnotation](#TypeAnnotation)*  
  
&emsp;&emsp;<a name="MethodSignature"></a>*MethodSignature* **:**  
&emsp;&emsp;&emsp;<a name="MethodSignature-68389351"></a>*[PropertyName](#PropertyName)*&emsp;`` ? ``<sub>opt</sub>&emsp;*[CallSignature](#CallSignature)*  
  
&emsp;&emsp;<a name="TypeAliasDeclaration"></a>*TypeAliasDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="TypeAliasDeclaration-86b51e79"></a>`` type ``&emsp;*[Identifier](#Identifier)*&emsp;`` = ``&emsp;*[Type](#Type)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="PropertyAssignment"></a>*PropertyAssignment* **:**  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-f2d90b76"></a>*[PropertyName](#PropertyName)*&emsp;`` : ``&emsp;*[AssignmentExpression](#AssignmentExpression)*  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-f47f84c4"></a>*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-9467bae2"></a>*[GetAccessor](#GetAccessor)*  
&emsp;&emsp;&emsp;<a name="PropertyAssignment-72d41f73"></a>*[SetAccessor](#SetAccessor)*  
  
&emsp;&emsp;<a name="GetAccessor"></a>*GetAccessor* **:**  
&emsp;&emsp;&emsp;<a name="GetAccessor-56ed38d2"></a>`` get ``&emsp;*[PropertyName](#PropertyName)*&emsp;`` ( ``&emsp;`` ) ``&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="SetAccessor"></a>*SetAccessor* **:**  
&emsp;&emsp;&emsp;<a name="SetAccessor-e450b10a"></a>`` set ``&emsp;*[PropertyName](#PropertyName)*&emsp;`` ( ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="ElementList"></a>*ElementList* **:**  
&emsp;&emsp;&emsp;<a name="ElementList-d806b57a"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*  
&emsp;&emsp;&emsp;<a name="ElementList-141a73d1"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*  
&emsp;&emsp;&emsp;<a name="ElementList-fd2af9b1"></a>*[ElementList](#ElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[AssignmentExpression](#AssignmentExpression)*  
&emsp;&emsp;&emsp;<a name="ElementList-6a579a6a"></a>*[ElementList](#ElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[SpreadElement](#SpreadElement)*  
  
&emsp;&emsp;<a name="SpreadElement"></a>*SpreadElement* **:**  
&emsp;&emsp;&emsp;<a name="SpreadElement-5bb8853e"></a>`` ... ``&emsp;*[AssignmentExpression](#AssignmentExpression)*  
  
&emsp;&emsp;<a name="CallExpression"></a>*CallExpression* **:**  
&emsp;&emsp;&emsp;<a name="CallExpression-35d9ba9f"></a>`` super ``&emsp;`` ( ``&emsp;*[ArgumentList](#ArgumentList)*<sub>opt</sub>&emsp;`` ) ``  
&emsp;&emsp;&emsp;<a name="CallExpression-f690ec4a"></a>`` super ``&emsp;`` . ``&emsp;*[IdentifierName](#IdentifierName)*  
  
&emsp;&emsp;<a name="FunctionExpression"></a>*FunctionExpression* **:**  
&emsp;&emsp;&emsp;<a name="FunctionExpression-ac6ff6fe"></a>`` function ``&emsp;*[Identifier](#Identifier)*<sub>opt</sub>&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AssignmentExpression"></a>*AssignmentExpression* **:**  
&emsp;&emsp;&emsp;<a name="AssignmentExpression-bead12de"></a>*[ArrowFunctionExpression](#ArrowFunctionExpression)*  
  
&emsp;&emsp;<a name="ArrowFunctionExpression"></a>*ArrowFunctionExpression* **:**  
&emsp;&emsp;&emsp;<a name="ArrowFunctionExpression-55d6be67"></a>*[ArrowFormalParameters](#ArrowFormalParameters)*&emsp;`` => ``&emsp;*[Block](#Block)*  
&emsp;&emsp;&emsp;<a name="ArrowFunctionExpression-05b42266"></a>*[ArrowFormalParameters](#ArrowFormalParameters)*&emsp;`` => ``&emsp;*[AssignmentExpression](#AssignmentExpression)*  
  
&emsp;&emsp;<a name="ArrowFormalParameters"></a>*ArrowFormalParameters* **:**  
&emsp;&emsp;&emsp;<a name="ArrowFormalParameters-c1501895"></a>*[CallSignature](#CallSignature)*  
&emsp;&emsp;&emsp;<a name="ArrowFormalParameters-06b6ace8"></a>*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="Arguments"></a>*Arguments* **:**  
&emsp;&emsp;&emsp;<a name="Arguments-e7c468c3"></a>*[TypeArguments](#TypeArguments)*<sub>opt</sub>&emsp;`` ( ``&emsp;*[ArgumentList](#ArgumentList)*<sub>opt</sub>&emsp;`` ) ``  
  
&emsp;&emsp;<a name="UnaryExpression"></a>*UnaryExpression* **:**  
&emsp;&emsp;&emsp;<a name="UnaryExpression-70eae169"></a>`` < ``&emsp;*[Type](#Type)*&emsp;`` > ``&emsp;*[UnaryExpression](#UnaryExpression)*  
  
&emsp;&emsp;<a name="VariableDeclaration"></a>*VariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-2e75bf14"></a>*[SimpleVariableDeclaration](#SimpleVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="VariableDeclaration-eaa77664"></a>*[DestructuringVariableDeclaration](#DestructuringVariableDeclaration)*  
  
&emsp;&emsp;<a name="SimpleVariableDeclaration"></a>*SimpleVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="SimpleVariableDeclaration-d903f0bc"></a>*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="TypeAnnotation"></a>*TypeAnnotation* **:**  
&emsp;&emsp;&emsp;<a name="TypeAnnotation-7d690620"></a>`` : ``&emsp;*[Type](#Type)*  
  
&emsp;&emsp;<a name="DestructuringVariableDeclaration"></a>*DestructuringVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="DestructuringVariableDeclaration-bc46404c"></a>*[BindingPattern](#BindingPattern)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*  
  
&emsp;&emsp;<a name="BindingPattern"></a>*BindingPattern* **:**  
&emsp;&emsp;&emsp;<a name="BindingPattern-987dce43"></a>*[ObjectBindingPattern](#ObjectBindingPattern)*  
&emsp;&emsp;&emsp;<a name="BindingPattern-c638d53b"></a>*[ArrayBindingPattern](#ArrayBindingPattern)*  
  
&emsp;&emsp;<a name="ObjectBindingPattern"></a>*ObjectBindingPattern* **:**  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-81ba5a4a"></a>`` { ``&emsp;`` } ``  
&emsp;&emsp;&emsp;<a name="ObjectBindingPattern-f5bb9114"></a>`` { ``&emsp;*[BindingPropertyList](#BindingPropertyList)*&emsp;`` , ``<sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="BindingPropertyList"></a>*BindingPropertyList* **:**  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-63dcfab3"></a>*[BindingProperty](#BindingProperty)*  
&emsp;&emsp;&emsp;<a name="BindingPropertyList-0730de3b"></a>*[BindingPropertyList](#BindingPropertyList)*&emsp;`` , ``&emsp;*[BindingProperty](#BindingProperty)*  
  
&emsp;&emsp;<a name="BindingProperty"></a>*BindingProperty* **:**  
&emsp;&emsp;&emsp;<a name="BindingProperty-03059906"></a>*[Identifier](#Identifier)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="BindingProperty-10e7598a"></a>*[PropertyName](#PropertyName)*&emsp;`` : ``&emsp;*[Identifier](#Identifier)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="BindingProperty-85bf9933"></a>*[PropertyName](#PropertyName)*&emsp;`` : ``&emsp;*[BindingPattern](#BindingPattern)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ArrayBindingPattern"></a>*ArrayBindingPattern* **:**  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-3493053b"></a>`` [ ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>opt</sub>&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-1d096493"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*&emsp;`` ] ``  
&emsp;&emsp;&emsp;<a name="ArrayBindingPattern-d766001e"></a>`` [ ``&emsp;*[BindingElementList](#BindingElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingRestElement](#BindingRestElement)*<sub>opt</sub>&emsp;`` ] ``  
  
&emsp;&emsp;<a name="BindingElementList"></a>*BindingElementList* **:**  
&emsp;&emsp;&emsp;<a name="BindingElementList-5a8f4d01"></a>*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingElement](#BindingElement)*  
&emsp;&emsp;&emsp;<a name="BindingElementList-4e199680"></a>*[BindingElementList](#BindingElementList)*&emsp;`` , ``&emsp;*[Elision](#Elision)*<sub>opt</sub>&emsp;*[BindingElement](#BindingElement)*  
  
&emsp;&emsp;<a name="BindingElement"></a>*BindingElement* **:**  
&emsp;&emsp;&emsp;<a name="BindingElement-03059906"></a>*[Identifier](#Identifier)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
&emsp;&emsp;&emsp;<a name="BindingElement-6875fa94"></a>*[BindingPattern](#BindingPattern)*&emsp;*[Initializer](#Initializer)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="BindingRestElement"></a>*BindingRestElement* **:**  
&emsp;&emsp;&emsp;<a name="BindingRestElement-ba1e81db"></a>`` ... ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="FunctionDeclaration"></a>*FunctionDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="FunctionDeclaration-9fb60434"></a>*[FunctionOverloads](#FunctionOverloads)*<sub>opt</sub>&emsp;*[FunctionImplementation](#FunctionImplementation)*  
  
&emsp;&emsp;<a name="FunctionOverloads"></a>*FunctionOverloads* **:**  
&emsp;&emsp;&emsp;<a name="FunctionOverloads-0a661d5e"></a>*[FunctionOverload](#FunctionOverload)*  
&emsp;&emsp;&emsp;<a name="FunctionOverloads-9866b7f2"></a>*[FunctionOverloads](#FunctionOverloads)*&emsp;*[FunctionOverload](#FunctionOverload)*  
  
&emsp;&emsp;<a name="FunctionOverload"></a>*FunctionOverload* **:**  
&emsp;&emsp;&emsp;<a name="FunctionOverload-dea5cafe"></a>`` function ``&emsp;*[Identifier](#Identifier)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="FunctionImplementation"></a>*FunctionImplementation* **:**  
&emsp;&emsp;&emsp;<a name="FunctionImplementation-44f98fb3"></a>`` function ``&emsp;*[Identifier](#Identifier)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="InterfaceDeclaration"></a>*InterfaceDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="InterfaceDeclaration-1cdcb447"></a>`` interface ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;*[InterfaceExtendsClause](#InterfaceExtendsClause)*<sub>opt</sub>&emsp;*[ObjectType](#ObjectType)*  
  
&emsp;&emsp;<a name="InterfaceExtendsClause"></a>*InterfaceExtendsClause* **:**  
&emsp;&emsp;&emsp;<a name="InterfaceExtendsClause-5fa66fb1"></a>`` extends ``&emsp;*[ClassOrInterfaceTypeList](#ClassOrInterfaceTypeList)*  
  
&emsp;&emsp;<a name="ClassOrInterfaceTypeList"></a>*ClassOrInterfaceTypeList* **:**  
&emsp;&emsp;&emsp;<a name="ClassOrInterfaceTypeList-cad70070"></a>*[ClassOrInterfaceType](#ClassOrInterfaceType)*  
&emsp;&emsp;&emsp;<a name="ClassOrInterfaceTypeList-9cf0c139"></a>*[ClassOrInterfaceTypeList](#ClassOrInterfaceTypeList)*&emsp;`` , ``&emsp;*[ClassOrInterfaceType](#ClassOrInterfaceType)*  
  
&emsp;&emsp;<a name="ClassOrInterfaceType"></a>*ClassOrInterfaceType* **:**  
&emsp;&emsp;&emsp;<a name="ClassOrInterfaceType-74e8bc50"></a>*[TypeReference](#TypeReference)*  
  
&emsp;&emsp;<a name="ClassDeclaration"></a>*ClassDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ClassDeclaration-16f719aa"></a>`` class ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;*[ClassHeritage](#ClassHeritage)*&emsp;`` { ``&emsp;*[ClassBody](#ClassBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="ClassHeritage"></a>*ClassHeritage* **:**  
&emsp;&emsp;&emsp;<a name="ClassHeritage-24f0c615"></a>*[ClassExtendsClause](#ClassExtendsClause)*<sub>opt</sub>&emsp;*[ImplementsClause](#ImplementsClause)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ClassExtendsClause"></a>*ClassExtendsClause* **:**  
&emsp;&emsp;&emsp;<a name="ClassExtendsClause-f9dd0dfb"></a>`` extends ``&emsp;*[ClassType](#ClassType)*  
  
&emsp;&emsp;<a name="ClassType"></a>*ClassType* **:**  
&emsp;&emsp;&emsp;<a name="ClassType-74e8bc50"></a>*[TypeReference](#TypeReference)*  
  
&emsp;&emsp;<a name="ImplementsClause"></a>*ImplementsClause* **:**  
&emsp;&emsp;&emsp;<a name="ImplementsClause-2a046db5"></a>`` implements ``&emsp;*[ClassOrInterfaceTypeList](#ClassOrInterfaceTypeList)*  
  
&emsp;&emsp;<a name="ClassBody"></a>*ClassBody* **:**  
&emsp;&emsp;&emsp;<a name="ClassBody-b9f281b3"></a>*[ClassElements](#ClassElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ClassElements"></a>*ClassElements* **:**  
&emsp;&emsp;&emsp;<a name="ClassElements-711bcbba"></a>*[ClassElement](#ClassElement)*  
&emsp;&emsp;&emsp;<a name="ClassElements-10ae112f"></a>*[ClassElements](#ClassElements)*&emsp;*[ClassElement](#ClassElement)*  
  
&emsp;&emsp;<a name="ClassElement"></a>*ClassElement* **:**  
&emsp;&emsp;&emsp;<a name="ClassElement-7594963d"></a>*[ConstructorDeclaration](#ConstructorDeclaration)*  
&emsp;&emsp;&emsp;<a name="ClassElement-322b3ffb"></a>*[PropertyMemberDeclaration](#PropertyMemberDeclaration)*  
&emsp;&emsp;&emsp;<a name="ClassElement-9293a271"></a>*[IndexMemberDeclaration](#IndexMemberDeclaration)*  
  
&emsp;&emsp;<a name="ConstructorDeclaration"></a>*ConstructorDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorDeclaration-99e2c89a"></a>*[ConstructorOverloads](#ConstructorOverloads)*<sub>opt</sub>&emsp;*[ConstructorImplementation](#ConstructorImplementation)*  
  
&emsp;&emsp;<a name="ConstructorOverloads"></a>*ConstructorOverloads* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorOverloads-41a6177c"></a>*[ConstructorOverload](#ConstructorOverload)*  
&emsp;&emsp;&emsp;<a name="ConstructorOverloads-2dbbf003"></a>*[ConstructorOverloads](#ConstructorOverloads)*&emsp;*[ConstructorOverload](#ConstructorOverload)*  
  
&emsp;&emsp;<a name="ConstructorOverload"></a>*ConstructorOverload* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorOverload-fe883f7d"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` constructor ``&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ConstructorImplementation"></a>*ConstructorImplementation* **:**  
&emsp;&emsp;&emsp;<a name="ConstructorImplementation-34afd5c4"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` constructor ``&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="PropertyMemberDeclaration"></a>*PropertyMemberDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="PropertyMemberDeclaration-9c558c1b"></a>*[MemberVariableDeclaration](#MemberVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="PropertyMemberDeclaration-e5bd8a89"></a>*[MemberFunctionDeclaration](#MemberFunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="PropertyMemberDeclaration-338d1587"></a>*[MemberAccessorDeclaration](#MemberAccessorDeclaration)*  
  
&emsp;&emsp;<a name="MemberVariableDeclaration"></a>*MemberVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="MemberVariableDeclaration-cbfd2fee"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;*[Initializer](#Initializer)*<sub>opt</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="MemberFunctionDeclaration"></a>*MemberFunctionDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionDeclaration-d9f4fd41"></a>*[MemberFunctionOverloads](#MemberFunctionOverloads)*<sub>opt</sub>&emsp;*[MemberFunctionImplementation](#MemberFunctionImplementation)*  
  
&emsp;&emsp;<a name="MemberFunctionOverloads"></a>*MemberFunctionOverloads* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionOverloads-bac756b8"></a>*[MemberFunctionOverload](#MemberFunctionOverload)*  
&emsp;&emsp;&emsp;<a name="MemberFunctionOverloads-c354b913"></a>*[MemberFunctionOverloads](#MemberFunctionOverloads)*&emsp;*[MemberFunctionOverload](#MemberFunctionOverload)*  
  
&emsp;&emsp;<a name="MemberFunctionOverload"></a>*MemberFunctionOverload* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionOverload-038c8b1f"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="MemberFunctionImplementation"></a>*MemberFunctionImplementation* **:**  
&emsp;&emsp;&emsp;<a name="MemberFunctionImplementation-8e940169"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` { ``&emsp;*[FunctionBody](#FunctionBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="MemberAccessorDeclaration"></a>*MemberAccessorDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="MemberAccessorDeclaration-38f5d586"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[GetAccessor](#GetAccessor)*  
&emsp;&emsp;&emsp;<a name="MemberAccessorDeclaration-bbe46c14"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[SetAccessor](#SetAccessor)*  
  
&emsp;&emsp;<a name="IndexMemberDeclaration"></a>*IndexMemberDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="IndexMemberDeclaration-526914fe"></a>*[IndexSignature](#IndexSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="EnumDeclaration"></a>*EnumDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="EnumDeclaration-a70c06aa"></a>`` const ``<sub>opt</sub>&emsp;`` enum ``&emsp;*[Identifier](#Identifier)*&emsp;`` { ``&emsp;*[EnumBody](#EnumBody)*<sub>opt</sub>&emsp;`` } ``  
  
&emsp;&emsp;<a name="EnumBody"></a>*EnumBody* **:**  
&emsp;&emsp;&emsp;<a name="EnumBody-686fbeb1"></a>*[EnumMemberList](#EnumMemberList)*&emsp;`` , ``<sub>opt</sub>  
  
&emsp;&emsp;<a name="EnumMemberList"></a>*EnumMemberList* **:**  
&emsp;&emsp;&emsp;<a name="EnumMemberList-5459409c"></a>*[EnumMember](#EnumMember)*  
&emsp;&emsp;&emsp;<a name="EnumMemberList-ec39fe71"></a>*[EnumMemberList](#EnumMemberList)*&emsp;`` , ``&emsp;*[EnumMember](#EnumMember)*  
  
&emsp;&emsp;<a name="EnumMember"></a>*EnumMember* **:**  
&emsp;&emsp;&emsp;<a name="EnumMember-06660efb"></a>*[PropertyName](#PropertyName)*  
&emsp;&emsp;&emsp;<a name="EnumMember-e8638251"></a>*[PropertyName](#PropertyName)*&emsp;`` = ``&emsp;*[EnumValue](#EnumValue)*  
  
&emsp;&emsp;<a name="EnumValue"></a>*EnumValue* **:**  
&emsp;&emsp;&emsp;<a name="EnumValue-d4fc7da4"></a>*[AssignmentExpression](#AssignmentExpression)*  
  
&emsp;&emsp;<a name="ModuleDeclaration"></a>*ModuleDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ModuleDeclaration-0c1d8d8b"></a>`` module ``&emsp;*[IdentifierPath](#IdentifierPath)*&emsp;`` { ``&emsp;*[ModuleBody](#ModuleBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="IdentifierPath"></a>*IdentifierPath* **:**  
&emsp;&emsp;&emsp;<a name="IdentifierPath-06b6ace8"></a>*[Identifier](#Identifier)*  
&emsp;&emsp;&emsp;<a name="IdentifierPath-3bb835f2"></a>*[IdentifierPath](#IdentifierPath)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="ModuleBody"></a>*ModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="ModuleBody-fec4dc75"></a>*[ModuleElements](#ModuleElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ModuleElements"></a>*ModuleElements* **:**  
&emsp;&emsp;&emsp;<a name="ModuleElements-8d133973"></a>*[ModuleElement](#ModuleElement)*  
&emsp;&emsp;&emsp;<a name="ModuleElements-268b379e"></a>*[ModuleElements](#ModuleElements)*&emsp;*[ModuleElement](#ModuleElement)*  
  
&emsp;&emsp;<a name="ModuleElement"></a>*ModuleElement* **:**  
&emsp;&emsp;&emsp;<a name="ModuleElement-a72ca256"></a>*[Statement](#Statement)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-34b71929"></a>`` export ``<sub>opt</sub>&emsp;*[VariableDeclaration](#VariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-6abe6389"></a>`` export ``<sub>opt</sub>&emsp;*[FunctionDeclaration](#FunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-a9b7ac21"></a>`` export ``<sub>opt</sub>&emsp;*[ClassDeclaration](#ClassDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-fa4fbeee"></a>`` export ``<sub>opt</sub>&emsp;*[InterfaceDeclaration](#InterfaceDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-34dc9187"></a>`` export ``<sub>opt</sub>&emsp;*[TypeAliasDeclaration](#TypeAliasDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-39d184a5"></a>`` export ``<sub>opt</sub>&emsp;*[EnumDeclaration](#EnumDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-f8c9cef1"></a>`` export ``<sub>opt</sub>&emsp;*[ModuleDeclaration](#ModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-d5fe2535"></a>`` export ``<sub>opt</sub>&emsp;*[ImportDeclaration](#ImportDeclaration)*  
&emsp;&emsp;&emsp;<a name="ModuleElement-eae3e7f7"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientDeclaration](#AmbientDeclaration)*  
  
&emsp;&emsp;<a name="ImportDeclaration"></a>*ImportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ImportDeclaration-1aa6f78c"></a>`` import ``&emsp;*[Identifier](#Identifier)*&emsp;`` = ``&emsp;*[EntityName](#EntityName)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="EntityName"></a>*EntityName* **:**  
&emsp;&emsp;&emsp;<a name="EntityName-82949a8b"></a>*[ModuleName](#ModuleName)*  
&emsp;&emsp;&emsp;<a name="EntityName-5a7de153"></a>*[ModuleName](#ModuleName)*&emsp;`` . ``&emsp;*[Identifier](#Identifier)*  
  
&emsp;&emsp;<a name="SourceFile"></a>*SourceFile* **:**  
&emsp;&emsp;&emsp;<a name="SourceFile-b2ed1f42"></a>*[ImplementationSourceFile](#ImplementationSourceFile)*  
&emsp;&emsp;&emsp;<a name="SourceFile-f2f895e8"></a>*[DeclarationSourceFile](#DeclarationSourceFile)*  
  
&emsp;&emsp;<a name="ImplementationSourceFile"></a>*ImplementationSourceFile* **:**  
&emsp;&emsp;&emsp;<a name="ImplementationSourceFile-c9861c0d"></a>*[ImplementationElements](#ImplementationElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="ImplementationElements"></a>*ImplementationElements* **:**  
&emsp;&emsp;&emsp;<a name="ImplementationElements-d9a7edd0"></a>*[ImplementationElement](#ImplementationElement)*  
&emsp;&emsp;&emsp;<a name="ImplementationElements-99927227"></a>*[ImplementationElements](#ImplementationElements)*&emsp;*[ImplementationElement](#ImplementationElement)*  
  
&emsp;&emsp;<a name="ImplementationElement"></a>*ImplementationElement* **:**  
&emsp;&emsp;&emsp;<a name="ImplementationElement-8d133973"></a>*[ModuleElement](#ModuleElement)*  
&emsp;&emsp;&emsp;<a name="ImplementationElement-d0c90aa3"></a>*[ExportAssignment](#ExportAssignment)*  
&emsp;&emsp;&emsp;<a name="ImplementationElement-e0a1092c"></a>*[AmbientExternalModuleDeclaration](#AmbientExternalModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="ImplementationElement-a24c5f54"></a>`` export ``<sub>opt</sub>&emsp;*[ExternalImportDeclaration](#ExternalImportDeclaration)*  
  
&emsp;&emsp;<a name="DeclarationSourceFile"></a>*DeclarationSourceFile* **:**  
&emsp;&emsp;&emsp;<a name="DeclarationSourceFile-38273fe5"></a>*[DeclarationElements](#DeclarationElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="DeclarationElements"></a>*DeclarationElements* **:**  
&emsp;&emsp;&emsp;<a name="DeclarationElements-2cbc20a6"></a>*[DeclarationElement](#DeclarationElement)*  
&emsp;&emsp;&emsp;<a name="DeclarationElements-5cb364b5"></a>*[DeclarationElements](#DeclarationElements)*&emsp;*[DeclarationElement](#DeclarationElement)*  
  
&emsp;&emsp;<a name="DeclarationElement"></a>*DeclarationElement* **:**  
&emsp;&emsp;&emsp;<a name="DeclarationElement-d0c90aa3"></a>*[ExportAssignment](#ExportAssignment)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-e0a1092c"></a>*[AmbientExternalModuleDeclaration](#AmbientExternalModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-fa4fbeee"></a>`` export ``<sub>opt</sub>&emsp;*[InterfaceDeclaration](#InterfaceDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-34dc9187"></a>`` export ``<sub>opt</sub>&emsp;*[TypeAliasDeclaration](#TypeAliasDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-d5fe2535"></a>`` export ``<sub>opt</sub>&emsp;*[ImportDeclaration](#ImportDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-eae3e7f7"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientDeclaration](#AmbientDeclaration)*  
&emsp;&emsp;&emsp;<a name="DeclarationElement-a24c5f54"></a>`` export ``<sub>opt</sub>&emsp;*[ExternalImportDeclaration](#ExternalImportDeclaration)*  
  
&emsp;&emsp;<a name="ExternalImportDeclaration"></a>*ExternalImportDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="ExternalImportDeclaration-cf7ef861"></a>`` import ``&emsp;*[Identifier](#Identifier)*&emsp;`` = ``&emsp;*[ExternalModuleReference](#ExternalModuleReference)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="ExternalModuleReference"></a>*ExternalModuleReference* **:**  
&emsp;&emsp;&emsp;<a name="ExternalModuleReference-ba0c8dfe"></a>`` require ``&emsp;`` ( ``&emsp;*[StringLiteral](#StringLiteral)*&emsp;`` ) ``  
  
&emsp;&emsp;<a name="ExportAssignment"></a>*ExportAssignment* **:**  
&emsp;&emsp;&emsp;<a name="ExportAssignment-dad84a0d"></a>`` export ``&emsp;`` = ``&emsp;*[Identifier](#Identifier)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientDeclaration"></a>*AmbientDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-cb9ab148"></a>`` declare ``&emsp;*[AmbientVariableDeclaration](#AmbientVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-396404d7"></a>`` declare ``&emsp;*[AmbientFunctionDeclaration](#AmbientFunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-4b890a8f"></a>`` declare ``&emsp;*[AmbientClassDeclaration](#AmbientClassDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-9e7af45a"></a>`` declare ``&emsp;*[AmbientEnumDeclaration](#AmbientEnumDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientDeclaration-54ae2790"></a>`` declare ``&emsp;*[AmbientModuleDeclaration](#AmbientModuleDeclaration)*  
  
&emsp;&emsp;<a name="AmbientVariableDeclaration"></a>*AmbientVariableDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientVariableDeclaration-ebd60185"></a>`` var ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientFunctionDeclaration"></a>*AmbientFunctionDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientFunctionDeclaration-dea5cafe"></a>`` function ``&emsp;*[Identifier](#Identifier)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientClassDeclaration"></a>*AmbientClassDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassDeclaration-932879ae"></a>`` class ``&emsp;*[Identifier](#Identifier)*&emsp;*[TypeParameters](#TypeParameters)*<sub>opt</sub>&emsp;*[ClassHeritage](#ClassHeritage)*&emsp;`` { ``&emsp;*[AmbientClassBody](#AmbientClassBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AmbientClassBody"></a>*AmbientClassBody* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassBody-a3220708"></a>*[AmbientClassBodyElements](#AmbientClassBodyElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="AmbientClassBodyElements"></a>*AmbientClassBodyElements* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElements-e310767b"></a>*[AmbientClassBodyElement](#AmbientClassBodyElement)*  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElements-17580f0a"></a>*[AmbientClassBodyElements](#AmbientClassBodyElements)*&emsp;*[AmbientClassBodyElement](#AmbientClassBodyElement)*  
  
&emsp;&emsp;<a name="AmbientClassBodyElement"></a>*AmbientClassBodyElement* **:**  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElement-ebca2f4e"></a>*[AmbientConstructorDeclaration](#AmbientConstructorDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElement-72bd6ea4"></a>*[AmbientPropertyMemberDeclaration](#AmbientPropertyMemberDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientClassBodyElement-0dd6b549"></a>*[IndexSignature](#IndexSignature)*  
  
&emsp;&emsp;<a name="AmbientConstructorDeclaration"></a>*AmbientConstructorDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientConstructorDeclaration-bc3a462d"></a>`` constructor ``&emsp;`` ( ``&emsp;*[ParameterList](#ParameterList)*<sub>opt</sub>&emsp;`` ) ``&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientPropertyMemberDeclaration"></a>*AmbientPropertyMemberDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientPropertyMemberDeclaration-e222cf95"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[TypeAnnotation](#TypeAnnotation)*<sub>opt</sub>&emsp;`` ; ``  
&emsp;&emsp;&emsp;<a name="AmbientPropertyMemberDeclaration-038c8b1f"></a>*[AccessibilityModifier](#AccessibilityModifier)*<sub>opt</sub>&emsp;`` static ``<sub>opt</sub>&emsp;*[PropertyName](#PropertyName)*&emsp;*[CallSignature](#CallSignature)*&emsp;`` ; ``  
  
&emsp;&emsp;<a name="AmbientEnumDeclaration"></a>*AmbientEnumDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientEnumDeclaration-fa872359"></a>*[EnumDeclaration](#EnumDeclaration)*  
  
&emsp;&emsp;<a name="AmbientModuleDeclaration"></a>*AmbientModuleDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleDeclaration-eacfc5ab"></a>`` module ``&emsp;*[IdentifierPath](#IdentifierPath)*&emsp;`` { ``&emsp;*[AmbientModuleBody](#AmbientModuleBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AmbientModuleBody"></a>*AmbientModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleBody-0199bc92"></a>*[AmbientModuleElements](#AmbientModuleElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="AmbientModuleElements"></a>*AmbientModuleElements* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleElements-6ae52e7f"></a>*[AmbientModuleElement](#AmbientModuleElement)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElements-f4bb9316"></a>*[AmbientModuleElements](#AmbientModuleElements)*&emsp;*[AmbientModuleElement](#AmbientModuleElement)*  
  
&emsp;&emsp;<a name="AmbientModuleElement"></a>*AmbientModuleElement* **:**  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-bc5c0551"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientVariableDeclaration](#AmbientVariableDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-b4c71f06"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientFunctionDeclaration](#AmbientFunctionDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-be77c07f"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientClassDeclaration](#AmbientClassDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-fa4fbeee"></a>`` export ``<sub>opt</sub>&emsp;*[InterfaceDeclaration](#InterfaceDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-75143f3f"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientEnumDeclaration](#AmbientEnumDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-4429ad19"></a>`` export ``<sub>opt</sub>&emsp;*[AmbientModuleDeclaration](#AmbientModuleDeclaration)*  
&emsp;&emsp;&emsp;<a name="AmbientModuleElement-d5fe2535"></a>`` export ``<sub>opt</sub>&emsp;*[ImportDeclaration](#ImportDeclaration)*  
  
&emsp;&emsp;<a name="AmbientExternalModuleDeclaration"></a>*AmbientExternalModuleDeclaration* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleDeclaration-732b3abf"></a>`` declare ``&emsp;`` module ``&emsp;*[StringLiteral](#StringLiteral)*&emsp;`` { ``&emsp;*[AmbientExternalModuleBody](#AmbientExternalModuleBody)*&emsp;`` } ``  
  
&emsp;&emsp;<a name="AmbientExternalModuleBody"></a>*AmbientExternalModuleBody* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleBody-3ae25d56"></a>*[AmbientExternalModuleElements](#AmbientExternalModuleElements)*<sub>opt</sub>  
  
&emsp;&emsp;<a name="AmbientExternalModuleElements"></a>*AmbientExternalModuleElements* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElements-11089657"></a>*[AmbientExternalModuleElement](#AmbientExternalModuleElement)*  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElements-e97b683d"></a>*[AmbientExternalModuleElements](#AmbientExternalModuleElements)*&emsp;*[AmbientExternalModuleElement](#AmbientExternalModuleElement)*  
  
&emsp;&emsp;<a name="AmbientExternalModuleElement"></a>*AmbientExternalModuleElement* **:**  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElement-6ae52e7f"></a>*[AmbientModuleElement](#AmbientModuleElement)*  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElement-d0c90aa3"></a>*[ExportAssignment](#ExportAssignment)*  
&emsp;&emsp;&emsp;<a name="AmbientExternalModuleElement-a24c5f54"></a>`` export ``<sub>opt</sub>&emsp;*[ExternalImportDeclaration](#ExternalImportDeclaration)*  
  
