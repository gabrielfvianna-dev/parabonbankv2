
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import theme from "../constants/theme";
import Button from "../components/Button";
import { apiRequest } from "../services/api";

const TIPOS_CHAVE = [
  { value: "CPF", label: "CPF" },
  { value: "EMAIL", label: "E-mail" },
  { value: "TELEFONE", label: "Telefone" },
  { value: "ALEATORIA", label: "Aleatória" },
];

export default function Pix() {
  const router = useRouter();

  const [chaves, setChaves] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("CPF");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

    // Dados da transferência
  const [chaveDestino, setChaveDestino] = useState("");
  const [valorPix, setValorPix] = useState("");
  const [descricaoPix, setDescricaoPix] = useState("");
  const [senhaPix, setSenhaPix] = useState("");

  // Controle das etapas
  const [destinatario, setDestinatario] = useState(null);
  const [consultando, setConsultando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function carregarChaves() {
    try {
      setError("");

      const resultado = await apiRequest("/api/pix/chaves");

      setChaves(resultado.chaves || []);
    } catch (erro) {
      setError(erro.message);
    } finally {
      setLoading(false);
    }
  }

  async function cadastrarChave() {
    try {
      setSaving(true);
      setError("");

      const resultado = await apiRequest("/api/pix/chaves", {
        method: "POST",
        body: JSON.stringify({
          keyType: tipoSelecionado,
        }),
      });

      Alert.alert("Sucesso", resultado.message);
      await carregarChaves();
    } catch (erro) {
      Alert.alert("Não foi possível cadastrar", erro.message);
    } finally {
      setSaving(false);
    }
  }

  function confirmarExclusao(chave) {
    Alert.alert(
      "Excluir chave Pix",
      `Deseja realmente excluir a chave ${chave.key}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirChave(chave.id),
        },
      ]
    );
  }

  async function excluirChave(id) {
    try {
      await apiRequest(`/api/pix/chaves/${id}`, {
        method: "DELETE",
      });

      Alert.alert("Sucesso", "Chave Pix excluída.");
      await carregarChaves();
    } catch (erro) {
      Alert.alert("Erro", erro.message);
    }
  }

    async function consultarDestinatario() {
    try {
      setConsultando(true);
      setDestinatario(null);

      const resultado = await apiRequest(
        "/api/pix/consultar-chave",
        {
          method: "POST",
          body: JSON.stringify({
            key: chaveDestino.trim(),
          }),
        }
      );

      setDestinatario(resultado.recipient);
    } catch (erro) {
      Alert.alert("Erro na consulta", erro.message);
    } finally {
      setConsultando(false);
    }
  }

    async function enviarPix() {
    try {
      setEnviando(true);

      const valor = Number(
        valorPix.replace(",", ".")
      );

      if (!Number.isFinite(valor) || valor <= 0) {
        Alert.alert("Valor inválido", "Informe um valor válido.");
        return;
      }

      if (!senhaPix.trim()) {
        Alert.alert("Senha necessária", "Informe sua senha.");
        return;
      }

      const resultado = await apiRequest("/api/pix/enviar", {
        method: "POST",
        body: JSON.stringify({
          key: chaveDestino.trim(),
          amount: valor,
          description: descricaoPix.trim(),
          password: senhaPix,
        }),
      });

      const comprovante = resultado.pix;

      Alert.alert(
        "Pix enviado com sucesso!",
        `Destinatário: ${comprovante.recipient.name}\n` +
        `Valor: R$ ${Number(comprovante.amount).toFixed(2)}\n` +
        `Status: ${comprovante.status}\n` +
        `Identificador: ${comprovante.endToEndId}`
      );

      setChaveDestino("");
      setValorPix("");
      setDescricaoPix("");
      setSenhaPix("");
      setDestinatario(null);

      await carregarChaves();
    } catch (erro) {
      Alert.alert("Não foi possível enviar", erro.message);
    } finally {
      setEnviando(false);
    }
  }

  useEffect(() => {
    carregarChaves();
  }, []);

  function nomeTipo(tipo) {
    return TIPOS_CHAVE.find((item) => item.value === tipo)?.label || tipo;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={styles.back}>← Voltar</Text>
      </Pressable>

      <Text style={styles.title}>Pix</Text>
      <Text style={styles.subtitle}>
        Gerencie suas chaves Pix e suas transferências.
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas chaves</Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.colors.burgundy}
          />
        ) : error ? (
          <View>
            <Text style={styles.error}>{error}</Text>
            <Button
              title="Tentar novamente"
              onPress={carregarChaves}
              variant="secondary"
            />
          </View>
        ) : chaves.length === 0 ? (
          <Text style={styles.empty}>
            Você ainda não possui chaves Pix cadastradas.
          </Text>
        ) : (
          chaves.map((chave) => (
            <View key={chave.id} style={styles.keyCard}>
              <View style={styles.keyInfo}>
                <Text style={styles.keyType}>
                  {nomeTipo(chave.keyType)}
                </Text>

                <Text style={styles.keyValue}>
                  {chave.key}
                </Text>

                <Text style={styles.keyStatus}>
                  {chave.status}
                </Text>
              </View>

              <Pressable
                onPress={() => confirmarExclusao(chave)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Excluir</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

            <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enviar Pix</Text>

        <Text style={styles.description}>Chave Pix do destinatário</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite a chave Pix"
          value={chaveDestino}
          onChangeText={(valor) => {
            setChaveDestino(valor);
            setDestinatario(null);
          }}
          autoCapitalize="none"
        />

        <Text style={styles.description}>Valor</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: 50,00"
          value={valorPix}
          onChangeText={setValorPix}
          keyboardType="decimal-pad"
        />

        <Text style={styles.description}>Descrição (opcional)</Text>

        <TextInput
          style={styles.input}
          placeholder="Descrição do Pix"
          value={descricaoPix}
          onChangeText={setDescricaoPix}
          maxLength={140}
        />

        <Button
          title="Consultar destinatário"
          onPress={consultarDestinatario}
          loading={consultando}
          disabled={!chaveDestino.trim() || consultando || enviando}
        />

        {destinatario && (
          <View style={styles.recipientCard}>
            <Text style={styles.sectionTitle}>Confirme o destinatário</Text>

            <Text style={styles.recipientText}>
              Nome: {destinatario.name}
            </Text>

            <Text style={styles.recipientText}>
              Banco: {destinatario.bankCode}
            </Text>

            <Text style={styles.recipientText}>
              Agência: {destinatario.agency}
            </Text>

            <Text style={styles.recipientText}>
              Conta: {destinatario.accountNumber}-{destinatario.accountDigit}
            </Text>

            <Text style={styles.description}>
              Confira os dados antes de continuar.
            </Text>

            <Text style={styles.description}>Sua senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senhaPix}
              onChangeText={setSenhaPix}
              secureTextEntry
            />

            <Button
              title="Confirmar e enviar Pix"
              onPress={enviarPix}
              loading={enviando}
              disabled={enviando || consultando || !senhaPix.trim()}
            />
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cadastrar nova chave</Text>

        <Text style={styles.description}>
          Escolha o tipo de chave que deseja cadastrar.
          Os dados serão obtidos do seu cadastro.
        </Text>

        {TIPOS_CHAVE.map((tipo) => (
          <Pressable
            key={tipo.value}
            onPress={() => setTipoSelecionado(tipo.value)}
            style={[
              styles.typeOption,
              tipoSelecionado === tipo.value && styles.selectedOption,
            ]}
          >
            <Text
              style={[
                styles.typeText,
                tipoSelecionado === tipo.value && styles.selectedText,
              ]}
            >
              {tipo.label}
            </Text>

            <Text style={styles.radio}>
              {tipoSelecionado === tipo.value ? "●" : "○"}
            </Text>
          </Pressable>
        ))}

        <Button
          title="Cadastrar chave"
          onPress={cadastrarChave}
          loading={saving}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.cream,
  },

  content: {
    padding: theme.spacing.lg,
    paddingTop: 55,
  },

  back: {
    color: theme.colors.burgundy,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: theme.spacing.lg,
  },

  title: {
    color: theme.colors.burgundy,
    fontSize: 30,
    fontWeight: "700",
  },

  subtitle: {
    color: theme.colors.espresso,
    fontSize: 15,
    marginTop: 6,
    marginBottom: theme.spacing.lg,
  },

  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.radius.large,
    marginBottom: theme.spacing.lg,
  },

  sectionTitle: {
    color: theme.colors.espresso,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: theme.spacing.md,
  },

  empty: {
    color: theme.colors.espresso,
    fontSize: 14,
    paddingVertical: theme.spacing.md,
  },

  keyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.cream,
  },

  keyInfo: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },

  keyType: {
    color: theme.colors.burgundy,
    fontWeight: "700",
    fontSize: 14,
  },

  keyValue: {
    color: theme.colors.espresso,
    fontSize: 14,
    marginTop: 4,
  },

  keyStatus: {
    color: theme.colors.espresso,
    fontSize: 12,
    marginTop: 4,
  },

  deleteButton: {
    padding: theme.spacing.sm,
  },

  deleteText: {
    color: theme.colors.wine,
    fontWeight: "700",
  },

  description: {
    color: theme.colors.espresso,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },

  typeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.burgundy,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },

  selectedOption: {
    backgroundColor: theme.colors.cream,
    borderWidth: 2,
  },

  typeText: {
    color: theme.colors.espresso,
    fontSize: 15,
  },

  selectedText: {
    color: theme.colors.burgundy,
    fontWeight: "700",
  },

  radio: {
    color: theme.colors.burgundy,
    fontSize: 18,
  },

  error: {
    color: theme.colors.wine,
    marginBottom: theme.spacing.md,
  },

    input: {
    backgroundColor: theme.colors.cream,
    borderWidth: 1,
    borderColor: theme.colors.burgundy,
    borderRadius: theme.radius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    color: theme.colors.espresso,
  },

  recipientCard: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.medium,
  },

  recipientText: {
    color: theme.colors.espresso,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
});
