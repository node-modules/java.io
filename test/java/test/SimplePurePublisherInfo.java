package test;
import java.io.Serializable;

public class SimplePurePublisherInfo implements Serializable {
  public SimplePurePublisherInfo(String hostId, String clientId) {
    this.hostId = hostId;
    this.clientId = clientId;
  }

  private static final long serialVersionUID = 5839365452784671213L;
  private boolean isClusterPublisher;
  private boolean isPersistent;
  private String clientId;
  private String hostId;

  @Override
  public String toString() {
    return "SimplePurePublisherInfo, hostId=" + this.hostId
        + ", serialVersionUID=" + this.serialVersionUID;
  }

  public int test() {
    int size = 0;
    return size++;
  }
}
